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
import { AppConfigService } from 'src/config/app/config.service';
import { Department } from 'src/modules/departments/entities/department.entity';
@Injectable()
export class CareUnitAdminService {
  private readonly SERVICE_KEY = this.appConfigService.serviceKey;
  private readonly EMERGENCY_API_URL = this.appConfigService.emergencyApiUrl;
  private readonly HOSPITAL_API_URL = this.appConfigService.hospitalApiUrl;
  private readonly PHARMACY_API_URL = this.appConfigService.pharmacyApiUrl;
  private readonly API_URL = this.appConfigService.hospitalApiUrl;
  private readonly HOSPITAL_BASIC_API_URL =
    this.appConfigService.hospitalBasicApiUrl;

  constructor(
    @InjectRepository(CareUnit)
    private readonly careUnitRepository: Repository<CareUnit>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly appConfigService: AppConfigService,
  ) {}

  //🏥응급실, 병의원, 약국 FullData 조회 - Api 통한
  async getAllCareUnit(
    pageNo: number = 1,
    numOfRows: number = 10,
  ): Promise<ResponseCareUnitDto[]> {
    try {
      const emergencyUrl = `${this.EMERGENCY_API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}&_type=json`;
      const hospitalUrl = `${this.HOSPITAL_API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}&_type=json`;
      const pharmacyUrl = `${this.PHARMACY_API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}&_type=json`;

      const emergencyResponse = await fetch(emergencyUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });
      const hospitalResponse = await fetch(hospitalUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });
      const pharmacyResponse = await fetch(pharmacyUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      const emergencyText = await emergencyResponse.text();
      console.log('응답 내용 (첫 300자):', emergencyText.slice(0, 300));
      const hospitalText = await hospitalResponse.text();
      console.log('응답 내용 (첫 300자):', hospitalText.slice(0, 300));
      const pharmacyText = await pharmacyResponse.text();
      console.log('응답 내용 (첫 300자):', pharmacyText.slice(0, 300));

      if (
        emergencyText.startsWith('<') ||
        hospitalText.startsWith('<') ||
        pharmacyText.startsWith('<')
      ) {
        console.error('❌ HTML/XML 응답 감지');
        throw new BadRequestException(
          'API가 XML/HTML을 반환했습니다. 실제 응답을 확인하세요.',
        );
      }

      const emergencyData = JSON.parse(emergencyText);
      const hospitalData = JSON.parse(hospitalText);
      const pharmacyData = JSON.parse(pharmacyText);

      const emergencyItems = emergencyData.response.body.items.item;
      const hospitalItems = hospitalData.response.body.items.item;
      const pharmacyItems = pharmacyData.response.body.items.item;

      const emergencies = Array.isArray(emergencyItems)
        ? emergencyItems
        : [emergencyItems];
      const hospitals = Array.isArray(hospitalItems)
        ? hospitalItems
        : [hospitalItems];
      const pharmacies = Array.isArray(pharmacyItems)
        ? pharmacyItems
        : [pharmacyItems];

      console.log('처리된 응급실 수:', emergencies.length);
      console.log('처리된 병의원 수:', hospitals.length);
      console.log('처리된 약국국 수:', pharmacies.length);

      const emergencyReturn = emergencies.map(
        (emergency): ResponseCareUnitDto => ({
          name: emergency.dutyName,
          address: emergency.dutyAddr,
          tel: emergency.dutyTel1,
          hpId: emergency.hpId,
          lat: parseFloat(emergency.wgs84Lat),
          lng: parseFloat(emergency.wgs84Lon),
          monday: { open: emergency.dutyTime1s, close: emergency.dutyTime1c },
          tuesday: { open: emergency.dutyTime2s, close: emergency.dutyTime2c },
          wednesday: {
            open: emergency.dutyTime3s,
            close: emergency.dutyTime3c,
          },
          thursday: { open: emergency.dutyTime4s, close: emergency.dutyTime4c },
          friday: { open: emergency.dutyTime5s, close: emergency.dutyTime5c },
          saturday: { open: emergency.dutyTime6s, close: emergency.dutyTime6c },
          sunday: { open: emergency.dutyTime7s, close: emergency.dutyTime7c },
          holiday: { open: emergency.dutyTime8s, close: emergency.dutyTime8c },
        }),
      );
      const hospitalReturn = hospitals.map(
        (hospital): ResponseCareUnitDto => ({
          name: hospital.dutyName,
          address: hospital.dutyAddr,
          tel: hospital.dutyTel1,
          hpId: hospital.hpId,
          lat: parseFloat(hospital.wgs84Lat),
          lng: parseFloat(hospital.wgs84Lon),
          monday: { open: hospital.dutyTime1s, close: hospital.dutyTime1c },
          tuesday: { open: hospital.dutyTime2s, close: hospital.dutyTime2c },
          wednesday: { open: hospital.dutyTime3s, close: hospital.dutyTime3c },
          thursday: { open: hospital.dutyTime4s, close: hospital.dutyTime4c },
          friday: { open: hospital.dutyTime5s, close: hospital.dutyTime5c },
          saturday: { open: hospital.dutyTime6s, close: hospital.dutyTime6c },
          sunday: { open: hospital.dutyTime7s, close: hospital.dutyTime7c },
          holiday: { open: hospital.dutyTime8s, close: hospital.dutyTime8c },
        }),
      );
      const pharmacyReturn = pharmacies.map(
        (pharmacy): ResponseCareUnitDto => ({
          name: pharmacy.dutyName,
          address: pharmacy.dutyAddr,
          tel: pharmacy.dutyTel1,
          hpId: pharmacy.hpId,
          lat: parseFloat(pharmacy.wgs84Lat),
          lng: parseFloat(pharmacy.wgs84Lon),
          monday: { open: pharmacy.dutyTime1s, close: pharmacy.dutyTime1c },
          tuesday: { open: pharmacy.dutyTime2s, close: pharmacy.dutyTime2c },
          wednesday: { open: pharmacy.dutyTime3s, close: pharmacy.dutyTime3c },
          thursday: { open: pharmacy.dutyTime4s, close: pharmacy.dutyTime4c },
          friday: { open: pharmacy.dutyTime5s, close: pharmacy.dutyTime5c },
          saturday: { open: pharmacy.dutyTime6s, close: pharmacy.dutyTime6c },
          sunday: { open: pharmacy.dutyTime7s, close: pharmacy.dutyTime7c },
          holiday: { open: pharmacy.dutyTime8s, close: pharmacy.dutyTime8c },
        }),
      );
      return [...emergencyReturn, ...hospitalReturn, ...pharmacyReturn];
    } catch (error: unknown) {
      const err = error as Error;
      console.error('❌ 에러 발생:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });
      throw new NotFoundException(
        `Failed to fetch pharmacy data: ${err.message}`,
      );
    }
  }

  // 초기 DB세팅 - 모든 careUnit 데이터 저장
  async saveAllCareUnits() {
    try {
      console.log('1️⃣ API 호출 시작');
      const url = `${this.API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=1&numOfRows=100000&_type=json`;
      console.log('2️⃣ API URL:', url);

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      console.log('3️⃣ API 응답 상태:', response.status);
      const text = await response.text();
      // console.log('4️⃣ API 응답 첫 300자:', text.slice(0, 300));

      if (text.startsWith('<')) {
        console.error('❌ XML/HTML 응답 감지');
        throw new BadRequestException('API가 XML/HTML을 반환했습니다.');
      }

      const data = JSON.parse(text);
      // console.log('5️⃣ 파싱된 데이터 구조:', {
      //   hasResponse: !!data.response,
      //   hasBody: !!data.response?.body,
      //   hasItems: !!data.response?.body?.items,
      //   hasItem: !!data.response?.body?.items?.item,
      // });

      const items = Array.isArray(data.response?.body?.items?.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      console.log('6️⃣ 처리된 아이템 수:', items.length);
      console.log('7️⃣ 첫 번째 아이템 샘플:', items[0]);

      // 1. 전체 데이터를 병원/ 약국으로 분류하여 저장. 100개씩 나누어 처리
      const batchSize = 100;
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        const careUnits = batch
          .map((item) => {
            if (!item?.hpid) {
              console.log('❌ hpId 없는 아이템 발견:', item);
              return null;
            }

            const parseTime = (
              value: string | number | null | undefined,
            ): number | undefined => {
              if (!value) return undefined;
              const num = Number(value);
              return isNaN(num) ? undefined : num;
            };

            const careUnit = this.careUnitRepository.create({
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

            return careUnit;
          })
          .filter(Boolean);

        if (careUnits.length > 0) {
          await this.careUnitRepository.save(careUnits);
          console.log(
            `✅ ${i + 1}~${i + careUnits.length}번째 데이터 저장 완료`,
          );
        }
      }

      // 2. 응급실 추가 저장
      console.log('🔄 응급실 데이터 처리 시작');
      const emergencyItems = items.filter(
        (item) => !item.dutyName.includes('약국') && item.dutyTel3,
      );
      console.log(`📊 처리할 응급실 수: ${emergencyItems.length}`);

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
        });

        if (emergencyUnits.length > 0) {
          await this.careUnitRepository.save(emergencyUnits);
          console.log(
            `${i + 1}~${i + emergencyUnits.length}번째 데이터 저장 완료`,
          );
        }
      }

      console.log('🎉 모든 의료기관 정보 저장 완료');
      return { message: '모든 의료기관 정보 저장 완료' };
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

  //🏥 응급실, 병의원, 약국 카테고리별 조회  (로딩 김 주의)
  async getCareUnitByCategory(category: string) {
    return await this.careUnitRepository.find({
      where: {
        category,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
