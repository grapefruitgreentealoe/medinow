import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CareUnit } from './entities/care-unit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseCareUnitDto } from './dto/response-care-unit.dto';

@Injectable()
export class CareUnitService {
  private readonly EMERGENCY_API_URL =
    'http://apis.data.go.kr/B552657/ErmctInfoInqireService/getEgytBassInfoInqire';
  private readonly HOSPITAL_API_URL =
    'http://apis.data.go.kr/B552657/HsptlAsembySearchService/getHsptlMdcncFullDown';
  private readonly PHARMACY_API_URL =
    'http://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyFullDown';
  private readonly SERVICE_KEY =
    'uSYZZA0PJht7szpyncFpPD55eZWnYbffebVFDNDkueIAXV1KOfeo1EBaJNNe342q8EseesWBpyWSsRwpNcborA==';

  constructor(
    @InjectRepository(CareUnit)
    private readonly careUnitRepository: Repository<CareUnit>,
  ) {}

  //🏥응급실, 병의원, 약국 FullData 조회
  async getAllCareUnit(
    pageNo: number = 1,
    numOfRows: number = 10,
  ): Promise<ResponseCareUnitDto[]> {
    try {
      const emergency_url = `${this.EMERGENCY_API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}&_type=json`;
      const hospital_url = `${this.HOSPITAL_API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}&_type=json`;
      const pharmacy_url = `${this.PHARMACY_API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}&_type=json`;

      const emergency_response = await fetch(emergency_url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });
      const hospital_response = await fetch(hospital_url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });
      const pharmacy_response = await fetch(pharmacy_url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      const emergency_text = await emergency_response.text();
      console.log('응답 내용 (첫 300자):', emergency_text.slice(0, 300));
      const hospital_text = await hospital_response.text();
      console.log('응답 내용 (첫 300자):', hospital_text.slice(0, 300));
      const pharmacy_text = await pharmacy_response.text();
      console.log('응답 내용 (첫 300자):', pharmacy_text.slice(0, 300));

      if (
        emergency_text.startsWith('<') ||
        hospital_text.startsWith('<') ||
        pharmacy_text.startsWith('<')
      ) {
        console.error('❌ HTML/XML 응답 감지');
        throw new BadRequestException(
          'API가 XML/HTML을 반환했습니다. 실제 응답을 확인하세요.',
        );
      }

      const emergency_data = JSON.parse(emergency_text);
      const hospital_data = JSON.parse(hospital_text);
      const pharmacy_data = JSON.parse(pharmacy_text);

      const emergency_items = emergency_data.response.body.items.item;
      const hospital_items = hospital_data.response.body.items.item;
      const pharmacy_items = pharmacy_data.response.body.items.item;

      const emergencies = Array.isArray(emergency_items)
        ? emergency_items
        : [emergency_items];
      const hospitals = Array.isArray(hospital_items)
        ? hospital_items
        : [hospital_items];
      const pharmacies = Array.isArray(pharmacy_items)
        ? pharmacy_items
        : [pharmacy_items];

      console.log('처리된 응급실 수:', emergencies.length);
      console.log('처리된 병의원 수:', hospitals.length);
      console.log('처리된 약국국 수:', pharmacies.length);

      const emergency_return = emergencies.map(
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
      const hospital_return = hospitals.map(
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
      const pharmacy_return = pharmacies.map(
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
      return [...emergency_return, ...hospital_return, ...pharmacy_return];
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

  //🏥 상세 정보 조회 
  async getCareUnitDetail(id: string) {
    return this.careUnitRepository.findOne({ where: { id } });
  }

  //🏥 위치 조회 
  async getCareUnitLocation(pageNo: number = 1, numOfRows: number = 10) {
    try {
      const url = `${this.EMERGENCY_API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}&_type=json`;
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
}
