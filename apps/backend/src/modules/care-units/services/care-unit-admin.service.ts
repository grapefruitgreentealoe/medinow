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

@Injectable()
export class CareUnitAdminService {
  private readonly SERVICE_KEY = this.appConfigService.serviceKey;
  private readonly API_URL = this.appConfigService.hospitalApiUrl;
  private readonly REDIS_CARE_UNIT_KEY = 'care_unit:';

  constructor(
    @InjectRepository(CareUnit)
    private readonly careUnitRepository: Repository<CareUnit>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly appConfigService: AppConfigService,
    private readonly redisService: RedisService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_11AM)
  async syncCareUnits() {
    console.log('🔄 의료기관 동기화 시작');
    try {
      const url = `${this.API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=1&numOfRows=100000&_type=json`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
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
          .map((item) => this.createCareUnit(item))
          .filter(Boolean);

        for (const careUnit of careUnits) {
          currentHpIds.add(careUnit.hpId);
          const redisKey = `${this.REDIS_CARE_UNIT_KEY}${careUnit.hpId}:${careUnit.category}`;
          const cachedData = await this.redisService.get(redisKey);

          if (!cachedData) {
            // 새로운 의료기관
            await this.careUnitRepository.save(careUnit);
            await this.redisService.set(redisKey, JSON.stringify(careUnit));
            addedCount++;
          } else {
            // 기존 의료기관 업데이트
            const existingData = JSON.parse(cachedData);
            if (this.hasChanges(existingData, careUnit)) {
              await this.careUnitRepository.upsert(careUnit, [
                'hpId',
                'category',
              ]);
              await this.redisService.set(redisKey, JSON.stringify(careUnit));
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

  private createCareUnit(item: any): CareUnit | null {
    if (!item?.hpid) return null;

    const parseTime = (
      value: string | number | null | undefined,
    ): number | undefined => {
      if (!value) return undefined;
      const num = Number(value);
      return isNaN(num) ? undefined : num;
    };

    return this.careUnitRepository.create({
      name: item.dutyName,
      address: item.dutyAddr,
      tel: item.dutyTel1,
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
      category: item.dutyName.includes('약국')
        ? CareUnitCategory.PHARMACY
        : CareUnitCategory.HOSPITAL,
    });
  }

  private hasChanges(existing: any, updated: CareUnit): boolean {
    const fieldsToCompare = [
      'name',
      'address',
      'tel',
      'lat',
      'lng',
      'mondayOpen',
      'mondayClose',
      'tuesdayOpen',
      'tuesdayClose',
      'wednesdayOpen',
      'wednesdayClose',
      'thursdayOpen',
      'thursdayClose',
      'fridayOpen',
      'fridayClose',
      'saturdayOpen',
      'saturdayClose',
      'sundayOpen',
      'sundayClose',
      'holidayOpen',
      'holidayClose',
      'category',
    ];

    return fieldsToCompare.some((field) => existing[field] !== updated[field]);
  }

  async saveAllCareUnits() {
    try {
      console.log('1️⃣ API 호출 시작');
      const url = `${this.API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=1&numOfRows=100000&_type=json`;
      console.log('2️⃣ API URL:', url);

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('3️⃣ API 응답 상태:', response.status);
      const text = await response.text();

      if (text.startsWith('<')) {
        console.error('❌ XML/HTML 응답 감지');
        return;
      }

      const data = JSON.parse(text);
      const items = Array.isArray(data.response?.body?.items?.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      console.log('6️⃣ 처리할 아이템 수:', items.length);

      const batchSize = 100;
      let hospitalCount = 0;
      let pharmacyCount = 0;
      let emergencyCount = 0;

      // 1. 병원과 약국 데이터 처리
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const careUnits = batch
          .map((item) => this.createCareUnit(item))
          .filter(Boolean);

        if (careUnits.length > 0) {
          await this.careUnitRepository.save(careUnits);

          // Redis에 저장
          for (const careUnit of careUnits) {
            const redisKey = `${this.REDIS_CARE_UNIT_KEY}${careUnit.hpId}:${careUnit.category}`;
            await this.redisService.set(redisKey, JSON.stringify(careUnit));
          }

          const hospitalBatch = careUnits.filter(
            (unit) => unit.category === CareUnitCategory.HOSPITAL,
          ).length;
          const pharmacyBatch = careUnits.filter(
            (unit) => unit.category === CareUnitCategory.PHARMACY,
          ).length;

          hospitalCount += hospitalBatch;
          pharmacyCount += pharmacyBatch;

          console.log(
            `✅ ${i + 1}~${i + careUnits.length}번째 데이터 저장 완료`,
            `(병원: ${hospitalBatch}, 약국: ${pharmacyBatch})`,
          );
        }
      }

      // 2. 응급실 데이터 처리
      console.log('🔄 응급실 데이터 처리 시작');
      const emergencyItems = items.filter(
        (item) => !item.dutyName.includes('약국') && item.dutyTel3,
      );
      console.log(`📊 처리할 응급실 수: ${emergencyItems.length}`);

      for (let i = 0; i < emergencyItems.length; i += batchSize) {
        const batch = emergencyItems.slice(i, i + batchSize);
        const emergencyUnits = batch
          .map((item) => {
            if (!item?.hpid) return null;

            const parseTime = (
              value: string | number | null | undefined,
            ): number | undefined => {
              if (!value) return undefined;
              const num = Number(value);
              return isNaN(num) ? undefined : num;
            };

            return this.careUnitRepository.create({
              name: item.dutyName,
              address: item.dutyAddr,
              tel: item.dutyTel3, // 응급실 전화번호 사용
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
          })
          .filter(Boolean);

        if (emergencyUnits.length > 0) {
          await this.careUnitRepository.save(emergencyUnits);

          // Redis에 저장
          for (const emergencyUnit of emergencyUnits) {
            const redisKey = `${this.REDIS_CARE_UNIT_KEY}${emergencyUnit.hpId}:${emergencyUnit.category}`;
            await this.redisService.set(
              redisKey,
              JSON.stringify(emergencyUnit),
            );
          }

          emergencyCount += emergencyUnits.length;
          console.log(
            `✅ ${i + 1}~${i + emergencyUnits.length}번째 응급실 데이터 저장 완료`,
          );
        }
      }

      console.log('🎉 모든 의료기관 정보 저장 완료');
      return {
        status: 'success',
        message: '모든 의료기관 정보 저장 완료',
        stats: {
          totalItems: items.length,
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
