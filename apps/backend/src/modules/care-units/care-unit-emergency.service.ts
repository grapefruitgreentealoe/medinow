import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CareUnit } from './entities/care-unit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CareUnitEmergencyService {
  private readonly EMERGENCY_API_URL =
    'http://apis.data.go.kr/B552657/ErmctInfoInqireService/getEgytBassInfoInqire';
  private readonly SERVICE_KEY = process.env.SERVICE_KEY;

  constructor(
    @InjectRepository(CareUnit)
    private readonly careUnitRepository: Repository<CareUnit>,
  ) {}

  //🏥응급실 데이터 조회 후 DB에 저장
  async saveEmergencyCareUnit() {
    try {
      const regionCodes = [
        '11', // 서울
        '26', // 부산
        '27', // 대구
        '28', // 인천
        '29', // 광주
        '30', // 대전
        '31', // 울산
        '36', // 세종
        '41', // 경기
        '42', // 강원
        '43', // 충북
        '44', // 충남
        '45', // 전북
        '46', // 전남
        '47', // 경북
        '48', // 경남
        '49', // 제주
        '50', // 제주
      ];

      const seenKeys = new Set<string>();
      const allEntities: CareUnit[] = [];

      for (const code of regionCodes) {
        console.log(`${code} 지역 응급실 데이터 조회 중...`);
        const emergencyUrl = `${this.EMERGENCY_API_URL}?ServiceKey=${this.SERVICE_KEY}&_type=json&Q0=${code}&pageNo=1&numOfRows=100`;
        const emergencyResponse = await fetch(emergencyUrl, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        });
        const emergencyText = await emergencyResponse.text();
        if (emergencyText.startsWith('<')) {
          throw new BadRequestException(
            'API가 XML/HTML을 반환했습니다. 실제 응답을 확인하세요.',
          );
        }
        const emergencyData = JSON.parse(emergencyText);
        const emergencyItems = Array.isArray(
          emergencyData.response.body.items.item,
        )
          ? emergencyData.response.body.items.item
          : [emergencyData.response.body.items.item];
        const onlyEmergencyItems = emergencyItems.filter(
          (item: any) => item.dutyEryn === 1,
        );

        console.log(
          `${code} 지역 응급실 데이터 조회 완료 : ${onlyEmergencyItems.length}개`,
        );

        for (const item of onlyEmergencyItems) {
          const key = item.hpid;
          if (seenKeys.has(key)) continue;
          seenKeys.add(key);

          const safeNumber = (val: any): number => {
            if (!val) throw new Error(`Invalid number value: ${val}`);
            const num = Number(val);
            if (isNaN(num)) throw new Error(`Cannot convert to number: ${val}`);
            return num;
          };

          const parseTime = (
            value: string | number | null | undefined,
          ): number | undefined => {
            if (!value) return undefined;
            const num = Number(value);
            return isNaN(num) ? undefined : num;
          };

          const entity = this.careUnitRepository.create({
            name: item.dutyName,
            address: item.dutyAddr,
            tel: item.dutyTel1,
            hpid: item.hpid,
            lat: safeNumber(item.wgs84Lat),
            lng: safeNumber(item.wgs84Lon),
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
            category: 'emergency',
            is_emergency: true,
          });
          allEntities.push(entity);
          console.log(`전체 조회 개수 : ${allEntities.length}개`);
        }
      }
      console.log('5. 저장 직전 엔티티 샘플:', allEntities[0]);
      await this.careUnitRepository.save(allEntities);
      return { message: '응급실 데이터 저장 완료' };
    } catch (error: unknown) {
      const err = error as Error;
      throw new NotFoundException(
        `Failed to fetch emergency data: ${err.message}`,
      );
    }
  }
}
