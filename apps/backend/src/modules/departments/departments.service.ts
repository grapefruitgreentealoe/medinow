import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CareUnit } from '../care-units/entities/care-unit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareUnitCategory } from 'src/common/enums/careUnits.enum';
import { AppConfigService } from 'src/config/app/config.service';
import { Department } from 'src/modules/departments/entities/department.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CustomLoggerService } from 'src/shared/logger/logger.service';
import { CareUnitService } from '../care-units/services/care-unit.service';

@Injectable()
// export class DepartmentsService {
export class DepartmentsService implements OnModuleInit {
  private readonly SERVICE_KEY = this.appConfigService.serviceKey;
  private readonly HOSPITAL_BASIC_API_URL =
    this.appConfigService.hospitalBasicApiUrl;

  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly appConfigService: AppConfigService,
    private readonly logger: CustomLoggerService,
    private readonly careUnitService: CareUnitService,
  ) {}

  async onModuleInit() {
    console.log('🚀 서버 시작 시 병원 진료과목 초기 데이터 저장 시작');
    try {
      await this.saveHospitalDepartments();
      console.log('✅ 병원 진료과목 초기 데이터 저장 완료');
    } catch (error) {
      const err = error as Error;
      this.logger.error('❌ 초기 데이터 저장 실패:', err.message);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncHospitalDepartments() {
    console.log('🔄 병원 진료과목 동기화 시작');
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

          // 4. 현재 저장된 진료과목 조회
          const existingDepartments = await this.departmentRepository.find({
            where: { careUnitId: hospitalCareUnit.id },
          });

          // 5. API에서 받은 진료과목 목록
          const newDepartments = hospital.dgidIdName
            .split(',')
            .map((dgIdName) => dgIdName.trim())
            .filter((dgIdName) => dgIdName)
            .map((dgIdName) => ({
              name: dgIdName,
              careUnitId: hospitalCareUnit.id,
            }));

          // 6. 삭제된 진료과목 찾기
          const departmentsToDelete = existingDepartments.filter(
            (existing) =>
              !newDepartments.some((newDept) => newDept.name === existing.name),
          );

          // 7. 새로운 진료과목 찾기
          const departmentsToAdd = newDepartments.filter(
            (newDept) =>
              !existingDepartments.some(
                (existing) => existing.name === newDept.name,
              ),
          );

          // 8. 삭제 실행
          if (departmentsToDelete.length > 0) {
            await this.departmentRepository.remove(departmentsToDelete);
            deletedCount += departmentsToDelete.length;
          }

          // 9. 추가 실행
          if (departmentsToAdd.length > 0) {
            const newDeptEntities = departmentsToAdd.map((dept) =>
              this.departmentRepository.create(dept),
            );
            await this.departmentRepository.save(newDeptEntities);
            addedCount += departmentsToAdd.length;
          }

          // 10. 변경된 진료과목이 있는 경우 로깅
          if (departmentsToDelete.length > 0 || departmentsToAdd.length > 0) {
            updatedCount++;
            console.log(
              `🔄 ${hospital.dutyName} 진료과목 업데이트:`,
              `삭제(${departmentsToDelete.length}),`,
              `추가(${departmentsToAdd.length})`,
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

      console.log('🎉 병원 진료과목 동기화 완료');
      console.log(
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
      console.log('1️⃣ 병원 진료과목 API 호출 시작');
      const url = `${this.HOSPITAL_BASIC_API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=1&numOfRows=1000000&_type=json`;
      console.log('2️⃣ API URL:', url);
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });
      console.log('3️⃣ API 응답 상태:', response.status);
      const text = await response.text();
      if (text.startsWith('<')) {
        console.error('❌ XML/HTML 응답 감지');
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

          // 기존 진료과목 데이터 삭제 (중복 방지)
          await this.departmentRepository.delete({
            careUnitId: hospitalCareUnit.id,
          });

          // 새로운 진료과목 데이터 저장
          const departments = hospital.dgidIdName
            .split(',')
            .map((dgIdName) => dgIdName.trim()) // 공백 제거
            .filter((dgIdName) => dgIdName) // 빈 문자열 제거
            .map((dgIdName) => {
              return this.departmentRepository.create({
                name: dgIdName,
                careUnitId: hospitalCareUnit.id,
              });
            });

          await this.departmentRepository.save(departments);
          successCount++;

          if (successCount % 1000 === 0) {
            console.log(
              `6️⃣ 진행 상황: ${successCount}/${hospitalItems.length} 처리 완료`,
            );
          }
        } catch (error) {
          const err = error as Error;
          console.error(
            `❌ 병원 진료과목 저장 실패 (${hospital.hpid}):`,
            err.message,
          );
          errorCount++;
        }
      }

      console.log('🎉 병원 진료과목 저장 완료');
      console.log(
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
      console.error('❌ 에러 발생:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });
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
}
