import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CareUnit } from '../entities/care-unit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareUnitCategory } from 'src/common/enums/careUnits.enum';
import { AppConfigService } from 'src/config/app/config.service';
import { Department } from 'src/modules/departments/entities/department.entity';
import { RedisService } from '../../redis/redis.service';
import { Cron } from '@nestjs/schedule';
import {
  createCareUnit,
  hasChanges,
  parseTime,
} from '../../../common/utils/care-unit.util';
import { CustomLoggerService } from 'src/shared/logger/logger.service';

@Injectable()
export class CareUnitAdminService {
  private readonly SERVICE_KEY = this.appConfigService.serviceKey;
  private readonly API_URL = this.appConfigService.hospitalApiUrl;
  private readonly API_URL2 = this.appConfigService.pharmacyApiUrl;
  private readonly REDIS_CARE_UNIT_KEY = 'care_unit:';

  constructor(
    @InjectRepository(CareUnit)
    private readonly careUnitRepository: Repository<CareUnit>,
    private readonly appConfigService: AppConfigService,
    private readonly redisService: RedisService,
    private readonly logger: CustomLoggerService,
  ) {
    this.MAX_RETRIES = 3;
    this.RETRY_DELAY = 5000;
  }

  private readonly MAX_RETRIES: number;
  private readonly RETRY_DELAY: number;

  @Cron('0 20 00 * * *')
  async syncCareUnits() {
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < this.MAX_RETRIES) {
      try {
        if (retryCount > 0) {
          await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        }

        const result = await this.executeSyncCareUnits();
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

  private async executeSyncCareUnits() {
    try {
      const url1 = `${this.API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=1&numOfRows=100000&_type=json`;
      const url2 = `${this.API_URL2}?ServiceKey=${this.SERVICE_KEY}&pageNo=1&numOfRows=100000&_type=json`;
      const response1 = await fetch(url1, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const response2 = await fetch(url2, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const text1 = await response1.text();
      if (text1.startsWith('<')) {
        this.logger.error('❌ XML/HTML 응답 감지');
        throw new BadRequestException('API가 XML/HTML을 반환했습니다.');
      }
      const text2 = await response2.text();
      if (text2.startsWith('<')) {
        this.logger.error('❌ XML/HTML 응답 감지');
        throw new BadRequestException('API가 XML/HTML을 반환했습니다.');
      }

      const data1 = JSON.parse(text1);
      const data2 = JSON.parse(text2);
      const items1 = Array.isArray(data1.response?.body?.items?.item)
        ? data1.response.body.items.item
        : [data1.response.body.items.item];
      const items2 = Array.isArray(data2.response?.body?.items?.item)
        ? data2.response.body.items.item
        : [data2.response.body.items.item];
      const items = [...items1, ...items2];

      let addedCount = 0;
      let updatedCount = 0;
      let deletedCount = 0;

      // Redis에서 현재 저장된 의료기관 조회
      const allRedisKeys = await this.redisService.scan(
        `${this.REDIS_CARE_UNIT_KEY}*`,
        1000,
      );

      const currentHpIds = new Set<string>();
      const batchSize = 100;

      // 새로운 데이터 처리
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const careUnits = batch
          .map((item) => createCareUnit(item))
          .filter(Boolean);

        for (const careUnit of careUnits) {
          currentHpIds.add(careUnit.hpId);
          const redisKey = `${this.REDIS_CARE_UNIT_KEY}${careUnit.hpId}:${careUnit.category}`;
          const cachedData = await this.redisService.get(redisKey);

          if (!cachedData) {
            // 새로운 의료기관
            await this.careUnitRepository.upsert(careUnit, [
              'hpId',
              'category',
            ]);
            await this.redisService.set(redisKey, JSON.stringify(careUnit));
            addedCount++;
          } else {
            // 기존 의료기관 업데이트
            const existingData = JSON.parse(cachedData);
            if (hasChanges(existingData, careUnit)) {
              await this.careUnitRepository.upsert(careUnit, [
                'hpId',
                'category',
              ]);
              await this.redisService.set(
                redisKey,
                JSON.stringify(careUnit),
                3600 * 48, // ttl 48시간 기준
              );
              updatedCount++;
            }
          }
        }
      }

      // 삭제된 의료기관 처리
      for (const key of allRedisKeys) {
        const [hpId, category] = key.split(':');
        if (!currentHpIds.has(hpId)) {
          await this.careUnitRepository.delete({ hpId, category });
          await this.redisService.del(key);
          deletedCount++;
        }
      }

      this.logger.log(
        `📊 통계:`,
        `추가(${addedCount}),`,
        `업데이트(${updatedCount}),`,
        `삭제(${deletedCount})`,
      );

      return {
        status: 'success',
        message: '의료기관 동기화 완료',
        stats: {
          addedCount,
          updatedCount,
          deletedCount,
        },
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error('❌ 동기화 에러 발생:', err.message);
      throw error;
    }
  }

  // 서버 시작 시 초기 데이터 저장
  async saveAllCareUnits() {
    try {
      const url1 = `${this.API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=1&numOfRows=100000&_type=json`;
      const url2 = `${this.API_URL2}?ServiceKey=${this.SERVICE_KEY}&pageNo=1&numOfRows=100000&_type=json`;

      const response1 = await fetch(url1, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const response2 = await fetch(url2, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const text1 = await response1.text();
      const text2 = await response2.text();

      if (text1.startsWith('<')) {
        this.logger.error('❌ XML/HTML 응답 감지');
        return;
      }
      if (text2.startsWith('<')) {
        this.logger.error('❌ XML/HTML 응답 감지');
        return;
      }

      const data1 = JSON.parse(text1);
      const data2 = JSON.parse(text2);

      const items1 = Array.isArray(data1.response?.body?.items?.item)
        ? data1.response.body.items.item
        : [data1.response.body.items.item];

      const items2 = Array.isArray(data2.response?.body?.items?.item)
        ? data2.response.body.items.item
        : [data2.response.body.items.item];

      const items = [...items1, ...items2];

      const batchSize = 100;
      let successCount = 0;

      // 한 번에 모든 데이터 처리 (약국, 병원, 응급실)
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const careUnits: CareUnit[] = [];

        for (const item of batch) {
          if (!item?.hpid) continue;

          // 약국인 경우 그대로 처리
          if (item.dutyName.includes('약국')) {
            const pharmacy = createCareUnit(item);
            if (pharmacy) careUnits.push(pharmacy);
          } else {
            // 모든 병원은 일반 병원으로 등록
            const hospital = createCareUnit(item);
            if (hospital) careUnits.push(hospital);

            // 응급실 번호(dutyTel3)가 있는 경우 응급실로도 추가 등록
            if (item.dutyTel3) {
              const emergency = this.careUnitRepository.create({
                name: item.dutyName,
                address: item.dutyAddr,
                tel: String(item.dutyTel3), // 응급실 전화번호 사용
                hpId: item.hpid,
                lat: parseFloat(item.wgs84Lat),
                lng: parseFloat(item.wgs84Lon),
                mondayOpen: 0,
                mondayClose: 2400,
                tuesdayOpen: 0,
                tuesdayClose: 2400,
                wednesdayOpen: 0,
                wednesdayClose: 2400,
                thursdayOpen: 0,
                thursdayClose: 2400,
                fridayOpen: 0,
                fridayClose: 2400,
                saturdayOpen: 0,
                saturdayClose: 2400,
                sundayOpen: 0,
                sundayClose: 2400,
                holidayOpen: 0,
                holidayClose: 2400,
                category: CareUnitCategory.EMERGENCY,
              });
              careUnits.push(emergency);
            }
          }
        }

        if (careUnits.length > 0) {
          // 기존 데이터 조회
          const existingUnits = await this.careUnitRepository.find({
            where: careUnits.map((unit) => ({
              hpId: unit.hpId,
              category: unit.category,
            })),
          });

          const existingMap = new Map(
            existingUnits.map((unit) => [
              `${unit.hpId}:${unit.category}`,
              unit,
            ]),
          );

          // 새로운 데이터와 변경된 데이터만 필터링
          const unitsToSave = careUnits.filter((unit) => {
            const key = `${unit.hpId}:${unit.category}`;
            const existing = existingMap.get(key);

            if (!existing) {
              this.logger.log(
                `➕ 새로운 데이터: ${unit.name} (${unit.hpId}) - ${unit.category}`,
              );
              return true;
            }

            const isChanged = hasChanges(existing, unit);
            if (isChanged) {
              this.logger.log(
                `🔄 변경된 데이터: ${unit.name} (${unit.hpId}) - ${unit.category}`,
              );
            }
            return isChanged;
          });

          if (unitsToSave.length > 0) {
            await this.careUnitRepository.upsert(unitsToSave, [
              'hpId',
              'category',
            ]);

            // Redis에 저장
            for (const careUnit of unitsToSave) {
              const redisKey = `${this.REDIS_CARE_UNIT_KEY}${careUnit.hpId}:${careUnit.category}`;
              await this.redisService.set(
                redisKey,
                JSON.stringify(careUnit),
                3600 * 48, // ttl 48시간 기준
              );
            }

            successCount += unitsToSave.length;
            this.logger.log(
              `✅ ${i + 1}~${i + unitsToSave.length}번째 데이터 저장 완료`,
            );
          }
        }
      }

      return {
        status: 'success',
        message: '모든 의료기관 정보 저장 완료',
        stats: {
          totalCount: successCount,
        },
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        '❌ 에러 발생:',
        `${err.name}: ${err.message}\n${err.stack}`,
      );
      throw new NotFoundException('Failed to save care units');
    }
  }
}
