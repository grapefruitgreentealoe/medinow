import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CareUnit } from '../entities/care-unit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ResponseCareUnitDto } from '../dto/response-care-unit.dto';
import { AppConfigService } from 'src/config/app/config.service';

@Injectable()
export class CareUnitService {
  private readonly EMERGENCY_API_URL = this.appConfigService.emergencyApiUrl;
  private readonly HOSPITAL_API_URL = this.appConfigService.hospitalApiUrl;
  private readonly PHARMACY_API_URL = this.appConfigService.pharmacyApiUrl;
  private readonly SERVICE_KEY = this.appConfigService.serviceKey;

  constructor(
    @InjectRepository(CareUnit)
    private readonly careUnitRepository: Repository<CareUnit>,
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
          hpid: emergency.hpid,
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
          hpid: hospital.hpid,
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
          hpid: pharmacy.hpid,
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

  //🏥 상세 정보 조회 by id
  async getCareUnitDetail(id: string) {
    return this.careUnitRepository.findOne({ where: { id } });
  }
  //🏥 상세 정보 조회 by hpid & category
  async getCareUnitDetailByHpid(hpid: string, category?: string) {
    return this.careUnitRepository.find({ where: { hpid, category } });
  }

  //🏥 상세 정보 조회 by 위치
  async getCareUnitDetailByLocation(lat: number, lng: number) {
    return this.careUnitRepository.find({
      where: {
        lat,
        lng,
      },
      order: {
        category: 'ASC',
        name: 'ASC',
      },
    });
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

  //🏥 응급실, 병의원, 약국 반경 별 카테고리 조회  (읍,면,동 단위) -> 반환값 없으면 더 넓은 값(버튼클릭)
  async getCareUnitByCategoryAndLocation(
    lat: number,
    lng: number,
    category?: string,
  ) {
    const queryBuilder = this.careUnitRepository.createQueryBuilder('careUnit');
    queryBuilder
      .where('careUnit.lat BETWEEN :minLat AND :maxLat', {
        minLat: lat - 0.005, // 0.005도 즉 0.5km 즉 500m
        maxLat: lat + 0.005,
      })
      .andWhere('careUnit.lng BETWEEN :minLng AND :maxLng', {
        minLng: lng - 0.005,
        maxLng: lng + 0.005,
      });
    // 카테고리 필터
    if (category) {
      queryBuilder.andWhere('careUnit.category = :category', { category });
      // 특정 카테고리 조회시 이름 오름차순
      queryBuilder.orderBy('careUnit.name', 'ASC');
    } else {
      // 전체 조회시 카테고리별 정렬 후 생성일자 내림차순
      queryBuilder
        .orderBy('careUnit.category', 'ASC')
        .addOrderBy('careUnit.createdAt', 'DESC');
    }
    return queryBuilder.getMany();
  }

  // 💫배지 추가
  async addBadge(id: string) {
    // 감사 기능 구현 후 감사 수에 따른 자동 배치 추가 필요
    const careUnit = await this.careUnitRepository.findOne({ where: { id } });
    if (!careUnit) {
      throw new NotFoundException('Care unit not found');
    }
    careUnit.is_badged = true;
    await this.careUnitRepository.save(careUnit);
    console.log('💫배지 추가 완료');
    return careUnit;
  }

  // ⏱️실시간 운영 여부 (프론트에서 호버 하면 좌표로 조회, 상세조회시에도)
  async checkNowOpen(id: string) {
    const careUnit = await this.careUnitRepository.findOne({ where: { id } });
    if (!careUnit) {
      throw new NotFoundException('Care unit not found');
    }
    let open;
    let close;
    const date = new Date();
    const day = date.getDay();
    if(day === 0) {
      open = careUnit.sundayOpen;
      close = careUnit.sundayClose;
    } else if(day === 1) {
      open = careUnit.mondayOpen;
      close = careUnit.mondayClose;
    } else if(day === 2) {
      open = careUnit.tuesdayOpen;
      close = careUnit.tuesdayClose;
    } else if(day === 3) {
      open = careUnit.wednesdayOpen;
      close = careUnit.wednesdayClose;
    } else if(day === 4) {
      open = careUnit.thursdayOpen;
      close = careUnit.thursdayClose;
    } else if(day === 5) {
      open = careUnit.fridayOpen;
      close = careUnit.fridayClose;
    } else if(day === 6) {
      open = careUnit.saturdayOpen;
      close = careUnit.saturdayClose;
    } else {
      open = careUnit.holidayOpen;
      close = careUnit.holidayClose;
    }
    const now = date.getHours() * 100 + date.getMinutes(); // 1430 형식 (14:30)
    console.log('date', date, 'now', now);
    if (
      (open <= now && close >= now)
    ) {
      console.log('⏱️지금 운영 중입니다');
      careUnit.now_open = true;
      await this.careUnitRepository.save(careUnit);
      return { message: '지금 운영 중입니다' };
    }
    console.log('❌지금 운영 중이 아닙니다');
    careUnit.now_open = false;
    await this.careUnitRepository.save(careUnit);
    return { message: '지금 운영 중이 아닙니다' };
  }
}
