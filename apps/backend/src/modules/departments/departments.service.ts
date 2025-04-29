import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareUnitCategory } from 'src/common/enums/careUnits.enum';
import { AppConfigService } from 'src/config/app/config.service';
import { Department } from './entities/department.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CustomLoggerService } from '../../shared/logger/logger.service';
import { CareUnitService } from '../care-units/services/care-unit.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class DepartmentsService {
  // export class DepartmentsService implements OnModuleInit {
  private readonly SERVICE_KEY = this.appConfigService.serviceKey;
  private readonly HOSPITAL_BASIC_API_URL =
    this.appConfigService.hospitalBasicApiUrl;
  private readonly REDIS_DEPARTMENT_KEY = 'department:';

  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly appConfigService: AppConfigService,
    private readonly logger: CustomLoggerService,
    private readonly careUnitService: CareUnitService,
    private readonly redisService: RedisService,
  ) {
    this.MAX_RETRIES = 3;
    this.RETRY_DELAY = 5000;
  }

  private readonly MAX_RETRIES: number;
  private readonly RETRY_DELAY: number;

  @Cron('0 40 00 * * *')
  async syncHospitalDepartments() {
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < this.MAX_RETRIES) {
      try {
        if (retryCount > 0) {
          await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        }

        const result = await this.executeSyncHospitalDepartments();
        if (retryCount > 0 && result) {
          this.logger.log(`🔄 동기화 성공: ${JSON.stringify(result)}`);
        }
        return result;
      } catch (error) {
        lastError = error as Error;
        this.logger.error(
          `❌ 동기화 실패 (시도 ${retryCount + 1}/${this.MAX_RETRIES}):`,
          lastError.message,
        );
        retryCount++;
      }
    }

    if (lastError) {
      this.logger.error(`🔄 최종 동기화 실패: ${lastError.message}`);
      throw lastError;
    }
  }

  private async executeSyncHospitalDepartments() {
    try {
      // 1. API에서 최신 데이터 가져오기
      const url = `${this.HOSPITAL_BASIC_API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=1&numOfRows=1000000&_type=json`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      const text = await response.text();
      if (text.startsWith('<')) {
        console.error('❌ XML/HTML 응답 감지');
        throw new BadRequestException('API가 XML/HTML을 반환했습니다.');
      }

      const data = JSON.parse(text);
      const items = Array.isArray(data.response?.body?.items?.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      // 2. 진료과목이 있는 병원만 필터링
      const hospitalItems = items.filter((item) => item.dgidIdName);

      let addedCount = 0;
      let updatedCount = 0;
      let deletedCount = 0;
      let skippedCount = 0;

      // 3. 각 병원별 진료과목 처리
      for (const hospital of hospitalItems) {
        try {
          const hospitalCareUnit =
            await this.careUnitService.getHospitalCareUnit(
              hospital.hpid,
              CareUnitCategory.HOSPITAL,
            );

          if (!hospitalCareUnit) {
            skippedCount++;
            continue;
          }

          // 4. Redis에서 현재 저장된 진료과목 조회
          const redisKey = `${this.REDIS_DEPARTMENT_KEY}${hospital.hpid}`;
          const cachedDepartments = await this.redisService.get(redisKey);
          const existingDepartments = cachedDepartments
            ? Array.isArray(JSON.parse(cachedDepartments))
              ? JSON.parse(cachedDepartments)
              : []
            : await this.departmentRepository.find({
                where: { careUnitId: hospitalCareUnit.id },
              });

          // 5. API에서 받은 진료과목 목록
          const newDepartments = hospital.dgidIdName
            .split(',')
            .map((dgIdName) => dgIdName.trim())
            .filter((dgIdName) => dgIdName)
            .map(
              (dgIdName): Partial<Department> => ({
                name: dgIdName,
                careUnitId: hospitalCareUnit.id,
              }),
            );

          // 6. 중복 제거를 위해 Set 사용
          const uniqueDepartments = Array.from(
            new Set(newDepartments.map((dept) => dept.name)),
          ).map(
            (name): Partial<Department> => ({
              name: name as string,
              careUnitId: hospitalCareUnit.id,
            }),
          );

          // 7. 삭제된 진료과목 찾기
          const departmentsToDelete = existingDepartments.filter(
            (existing) =>
              !uniqueDepartments.some(
                (newDept) => newDept.name === existing.name,
              ),
          );

          // 8. 삭제 실행
          if (departmentsToDelete.length > 0) {
            await this.departmentRepository.remove(departmentsToDelete);
            deletedCount += departmentsToDelete.length;
          }

          // 9. 추가 실행
          if (uniqueDepartments.length > 0) {
            await this.departmentRepository.upsert(uniqueDepartments, [
              'careUnitId',
              'name',
            ]);
            addedCount += uniqueDepartments.length;
          }

          // 10. Redis 업데이트
          if (departmentsToDelete.length > 0 || uniqueDepartments.length > 0) {
            const updatedDepartments = await this.departmentRepository.find({
              where: { careUnitId: hospitalCareUnit.id },
            });
            await this.redisService.set(
              redisKey,
              JSON.stringify(updatedDepartments),
              3600 * 48, // TTL 48시간 (2일) - Cron 작업 실패 대비
            );
            updatedCount++;
            console.log(
              `🔄 ${hospital.dutyName} 진료과목 업데이트:`,
              `삭제(${departmentsToDelete.length}),`,
              `추가(${uniqueDepartments.length})`,
            );
          }
        } catch (error) {
          const err = error as Error;
          this.logger.error(
            `❌ 병원 진료과목 처리 실패 (${hospital.hpid}):`,
            err.message,
          );
        }
      }

      // 11. 삭제된 병원의 Redis 데이터 정리
      const allRedisKeys = await this.redisService.scan(
        `${this.REDIS_DEPARTMENT_KEY}*`,
        1000,
      );
      const currentHpIds = hospitalItems.map((h) => h.hpid);
      for (const key of allRedisKeys) {
        const hpId = key.replace(this.REDIS_DEPARTMENT_KEY, '');
        if (!currentHpIds.includes(hpId)) {
          await this.redisService.del(key);
        }
      }

      this.logger.log(
        `📊 통계:`,
        `추가(${addedCount}),`,
        `삭제(${deletedCount}),`,
        `업데이트된 병원(${updatedCount}),`,
        `건너뜀(${skippedCount})`,
      );

      return {
        status: 'success',
        message: '병원 진료과목 동기화 완료',
        stats: {
          addedCount,
          deletedCount,
          updatedCount,
          skippedCount,
        },
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error('❌ 동기화 에러 발생:', err.message);
      throw new NotFoundException('Failed to sync hospital departments');
    }
  }

  // 초기 DB세팅 - hospital 진료과목 데이터 저장
  async saveHospitalDepartments() {
    try {
      const url = `${this.HOSPITAL_BASIC_API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=1&numOfRows=1000000&_type=json`;

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      const text = await response.text();
      if (text.startsWith('<')) {
        this.logger.error('❌ XML/HTML 응답 감지');
        throw new BadRequestException('API가 XML/HTML을 반환했습니다.');
      }
      const data = JSON.parse(text);
      const items = Array.isArray(data.response?.body?.items?.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      // 1. category에서 hospital 데이터만 추출 (dgidIdName이 있고 category가 hospital인 경우만)
      const hospitalItems = items.filter((item) => item.dgidIdName);

      let successCount = 0;
      let errorCount = 0;
      let skippedCount = 0;

      // 2. 각 병원별 진료과목 데이터 저장
      for (const hospital of hospitalItems) {
        try {
          // hospital 카테고리인 CareUnit만 찾기
          const hospitalCareUnit =
            await this.careUnitService.getHospitalCareUnit(
              hospital.hpid,
              CareUnitCategory.HOSPITAL,
            );

          if (!hospitalCareUnit) {
            skippedCount++;
            continue; // 다음 병원으로 넘어감
          }
          const redisKey = `${this.REDIS_DEPARTMENT_KEY}${hospital.hpid}`;

          const cachedDepartments = await this.redisService.get(redisKey);
          const existingDepartments = cachedDepartments
            ? Array.isArray(JSON.parse(cachedDepartments))
              ? JSON.parse(cachedDepartments)
              : []
            : await this.departmentRepository.find({
                where: { careUnitId: hospitalCareUnit.id },
              });

          // 새로운 진료과목 데이터 저장
          const newDepartments = hospital.dgidIdName
            .split(',')
            .map((dgIdName) => dgIdName.trim())
            .filter((dgIdName) => dgIdName)
            .map(
              (dgIdName): Partial<Department> => ({
                name: dgIdName,
                careUnitId: hospitalCareUnit.id,
              }),
            );

          // 중복 제거를 위해 Set 사용
          const uniqueDepartments = Array.from(
            new Set(newDepartments.map((dept) => dept.name)),
          ).map(
            (name): Partial<Department> => ({
              name: name as string,
              careUnitId: hospitalCareUnit.id,
            }),
          );

          const departmentsToDelete = existingDepartments.filter(
            (existing) =>
              !uniqueDepartments.some(
                (newDept) => newDept.name === existing.name,
              ),
          );

          if (departmentsToDelete.length > 0) {
            await this.departmentRepository.remove(departmentsToDelete);
          }

          // upsert를 사용하여 중복 에러 방지
          if (uniqueDepartments.length > 0) {
            await this.departmentRepository.upsert(uniqueDepartments, [
              'careUnitId',
              'name',
            ]);
          }

          // Redis 업데이트
          const updatedDepartments = await this.departmentRepository.find({
            where: { careUnitId: hospitalCareUnit.id },
          });
          await this.redisService.set(
            redisKey,
            JSON.stringify(updatedDepartments),
            3600 * 48, // TTL 48시간 (2일) - Cron 작업 실패 대비
          );
          successCount++;

          if (successCount % 1000 === 0) {
            console.log(
              `✨ 진행 상황: ${successCount}/${hospitalItems.length} 처리 완료!`,
            );
          }
        } catch (error) {
          const err = error as Error;
          this.logger.error(
            `❌ 병원 진료과목 저장 실패 (${hospital.hpid}):`,
            err.message,
          );
          errorCount++;
        }
      }

      this.logger.log(
        `✅ 성공: ${successCount}, ⚠️ 건너뜀: ${skippedCount}, ❌ 실패: ${errorCount}`,
      );

      return {
        status: 'success',
        message: '병원 진료과목 저장 완료',
        stats: {
          totalItems: items.length,
          hospitalItems: hospitalItems.length,
          successCount,
          skippedCount,
          errorCount,
        },
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        '❌ 에러 발생:',
        `${err.name}: ${err.message}\n${err.stack}`,
      );
      throw new NotFoundException('Failed to save hospital departments');
    }
  }

  // 한 기관의 진료과목 전체 조회
  async getHospitalDepartments(careUnitId: string) {
    const departments = await this.departmentRepository.find({
      where: {
        careUnitId: careUnitId,
      },
      relations: ['careUnit'],
    });
    return departments;
  }

  async getDepartmentById(id: string) {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['careUnit'],
    });
    if (!department) {
      throw new NotFoundException('Department not found');
    }
    return department;
  }
}
