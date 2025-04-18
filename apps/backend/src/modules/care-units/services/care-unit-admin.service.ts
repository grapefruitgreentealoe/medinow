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
  private readonly API_URL = this.appConfigService.hospitalApiUrl;
  private readonly HOSPITAL_BASIC_API_URL =
    this.appConfigService.hospitalBasicApiUrl;
  private readonly SERVICE_KEY = this.appConfigService.serviceKey;

  constructor(
    @InjectRepository(CareUnit)
    private readonly careUnitRepository: Repository<CareUnit>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly appConfigService: AppConfigService,
  ) {}

  // 초기 DB세팅 - 모든 careUnit 데이터 저장
  async saveAllCareUnits() {
    try {
      console.log('1️⃣ API 호출 시작');
      const url = `${this.API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=1&numOfRows=100000&_type=json`;
      console.log('2️⃣ API URL:', url);

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
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

  // 초기 DB세팅 - hospital 진료과목 데이터 저장
  async saveHospitalDepartments() {
    try {
      console.log('1️⃣ 병원 진료과목 API 호출 시작');
      const url = `${this.HOSPITAL_BASIC_API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=1&numOfRows=100&_type=json`;
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

      // 1. category에서 hospital 데이터만 추출
      const hospitalItems = items.filter((item) => item.dgidIdName);
      // 2. 각 병원별 진료과목 데이터 저장
      for (const hospital of hospitalItems) {
        const HospitalCareUnit = await this.careUnitRepository.findOne({
          where: { hpId: hospital.hpid, category: hospital.category },
        });
        if (!HospitalCareUnit) {
          console.error('❌ 병원을 찾을 수 없음:', hospital.hpid);
          throw new NotFoundException('Care unit not found');
        }
        const departments = hospital.dgidIdName.split(',').map((dgIdName) => {
          return this.departmentRepository.create({
            name: dgIdName,
            careUnitId: HospitalCareUnit.id,
          });
        });
        await this.departmentRepository.save(departments);
      }
      console.log('🎉 병원 진료과목 저장 완료');
      return { status: 'success', message: '병원 진료과목 저장 완료' };
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
}
