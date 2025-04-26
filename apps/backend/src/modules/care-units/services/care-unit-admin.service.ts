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
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  createCareUnit,
  hasChanges,
  parseTime,
} from '../../../common/utils/care-unit.util';

@Injectable()
export class CareUnitAdminService {
  private readonly SERVICE_KEY = this.appConfigService.serviceKey;
  private readonly API_URL = this.appConfigService.hospitalApiUrl;
  private readonly API_URL2 = this.appConfigService.pharmacyApiUrl;
  private readonly REDIS_CARE_UNIT_KEY = 'care_unit:';

  constructor(
    @InjectRepository(CareUnit)
    private readonly careUnitRepository: Repository<CareUnit>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly appConfigService: AppConfigService,
    private readonly redisService: RedisService,
  ) {}

  @Cron('0 53 22 * * *')
  async syncCareUnits() {
    console.log('🔄 의료기관 동기화 시작');
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
        console.error('❌ XML/HTML 응답 감지');
        throw new BadRequestException('API가 XML/HTML을 반환했습니다.');
      }
      const text2 = await response2.text();
      if (text2.startsWith('<')) {
        console.error('❌ XML/HTML 응답 감지');
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
                3600 * 24, // ttl 하루 기준
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

      console.log('🎉 의료기관 동기화 완료');
      console.log(
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
      console.error('❌ 동기화 에러 발생:', error);
      throw error;
    }
  }

  // 서버 시작 시 초기 데이터 저장
  async saveAllCareUnits() {
    try {
      console.log('▶️ API 호출 시작');
      const url1 = `${this.API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=1&numOfRows=100000&_type=json`;
      const url2 = `${this.API_URL2}?ServiceKey=${this.SERVICE_KEY}&pageNo=1&numOfRows=100000&_type=json`;
      console.log('▶️  API URL:', url1);
      console.log('▶️  API URL:', url2);

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

      console.log('▶️  API 응답 상태:', response1.status);
      const text1 = await response1.text();
      console.log('▶️  API 응답 상태:', response2.status);
      const text2 = await response2.text();

      if (text1.startsWith('<')) {
        console.error('❌ XML/HTML 응답 감지');
        return;
      }
      if (text2.startsWith('<')) {
        console.error('❌ XML/HTML 응답 감지');
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

      console.log('▶️  처리할 아이템 수:', items.length);

      const batchSize = 100;
      let hospitalCount = 0;
      let pharmacyCount = 0;
      let emergencyCount = 0;

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
                mondayOpen: parseTime(item.dutyTime1s),
                mondayClose: parseTime(item.dutyTime1c),
                tuesdayOpen: parseTime(item.dutyTime2s),
                tuesdayClose: parseTime(item.dutyTime2c),
                wednesdayOpen: parseTime(item.dutyTime3s),
                wednesdayClose: parseTime(item.dutyTime3c),
                thursdayOpen: parseTime(item.dutyTime4s),
                thursdayClose: parseTime(item.dutyTime4c),
                fridayOpen: parseTime(item.dutyTime5s),
                fridayClose: parseTime(item.dutyTime5c),
                saturdayOpen: parseTime(item.dutyTime6s),
                saturdayClose: parseTime(item.dutyTime6c),
                sundayOpen: parseTime(item.dutyTime7s),
                sundayClose: parseTime(item.dutyTime7c),
                holidayOpen: parseTime(item.dutyTime8s),
                holidayClose: parseTime(item.dutyTime8c),
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
              console.log(
                `➕ 새로운 데이터: ${unit.name} (${unit.hpId}) - ${unit.category}`,
              );
              return true;
            }

            const isChanged = hasChanges(existing, unit);
            if (isChanged) {
              console.log(
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
                3600 * 24,
              ); // ttl 하루 기준
            }

            // 카테고리별 카운팅
            const hospitalBatch = unitsToSave.filter(
              (unit) =>
                (unit.category as CareUnitCategory) ===
                CareUnitCategory.HOSPITAL,
            ).length;
            const pharmacyBatch = unitsToSave.filter(
              (unit) =>
                (unit.category as CareUnitCategory) ===
                CareUnitCategory.PHARMACY,
            ).length;
            const emergencyBatch = unitsToSave.filter(
              (unit) =>
                (unit.category as CareUnitCategory) ===
                CareUnitCategory.EMERGENCY,
            ).length;

            hospitalCount += hospitalBatch;
            pharmacyCount += pharmacyBatch;
            emergencyCount += emergencyBatch;

            console.log(
              `✅ ${i + 1}~${i + unitsToSave.length}번째 데이터 저장 완료 ` +
                `(병원: ${hospitalBatch}, 약국: ${pharmacyBatch}, 응급실: ${emergencyBatch})`,
            );
          }
        }
      }

      console.log('🎉 모든 의료기관 정보 저장 완료');
      return {
        status: 'success',
        message: '모든 의료기관 정보 저장 완료',
        stats: {
          hospitalCount,
          pharmacyCount,
          emergencyCount,
        },
      };
    } catch (error) {
      const err = error as Error;
      console.error('❌ 에러 발생:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });
      throw new NotFoundException('Failed to save care units');
    }
  }
}
