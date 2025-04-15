import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CareUnit } from '../entities/care-unit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseCareUnitDto } from '../dto/response-care-unit.dto';
import { CareUnitCategory } from 'src/common/enums/careUnits.enum';

@Injectable()
export class CareUnitAdminService {
  private readonly EMERGENCY_API_URL =
    'http://apis.data.go.kr/B552657/ErmctInfoInqireService/getEgytBassInfoInqire';
  private readonly HOSPITAL_API_URL =
    'http://apis.data.go.kr/B552657/HsptlAsembySearchService/getHsptlMdcncFullDown';
  private readonly PHARMACY_API_URL =
    'http://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyFullDown';
  private readonly API_URL =
    'https://apis.data.go.kr/B552657/HsptlAsembySearchService/getHsptlMdcncFullDown';
  private readonly SERVICE_KEY = process.env.SERVICE_KEY;

  constructor(
    @InjectRepository(CareUnit)
    private readonly careUnitRepository: Repository<CareUnit>,
  ) {}

  // 초기 DB세팅 - 모든 careUnit 데이터 저장
  async saveAllCareUnits() {
    try {
      const url = `${this.API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=1&numOfRows=100000&_type=json`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });
      const text = await response.text();
      if (text.startsWith('<')) {
        throw new BadRequestException('API가 XML/HTML을 반환했습니다.');
      }
      const data = JSON.parse(text);
      const items = Array.isArray(data.response?.body?.items?.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      // 1. 전체 데이터를 병원/ 약국으로 분류하여 저장. 100개씩 나누어 처리
      const batchSize = 100;
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const careUnits = batch
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
              tel: item.dutyTel1,
              hpid: item.hpid,
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
          })
          .filter(Boolean);

        if (careUnits.length > 0) {
          await this.careUnitRepository.save(careUnits);
          console.log(`${i + 1}~${i + careUnits.length}번째 데이터 저장 완료`);
        }
      }
      console.log('병원/약국 저장 완료');

      // 2. 응급실 추가 저장
      const emergencyItems = items.filter(
        (item) => !item.dutyName.includes('약국') && item.dutyTel3,
      );

      for (let i = 0; i < emergencyItems.length; i += batchSize) {
        const batch = emergencyItems.slice(i, i + batchSize);
        const emergencyUnits = batch.map((item) => {
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
            tel: item.dutyTel3,
            hpid: item.hpid,
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
        });

        if (emergencyUnits.length > 0) {
          await this.careUnitRepository.save(emergencyUnits);
          console.log(
            `${i + 1}~${i + emergencyUnits.length}번째 데이터 저장 완료`,
          );
        }
      }

      console.log('모든 의료기관 정보 저장 완료');
      return { message: '모든 의료기관 정보 저장 완료' };
    } catch (error) {
      console.error('❌ 에러 발생:', error);
      throw new NotFoundException('Failed to save care units');
    }
  }
}
