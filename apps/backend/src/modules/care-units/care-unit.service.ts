import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCareUnitDto } from './dto/create-care-unit.dto';
import { UpdateCareUnitDto } from './dto/update-care-unit.dto';
import { CareUnit } from './entities/care-unit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseCareUnitDto } from './dto/response-care-unit.dto';

@Injectable()
export class CareUnitService {
  private readonly API_URL =
    'http://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyFullDown';
  private readonly SERVICE_KEY =
    'uSYZZA0PJht7szpyncFpPD55eZWnYbffebVFDNDkueIAXV1KOfeo1EBaJNNe342q8EseesWBpyWSsRwpNcborA==';

  constructor(
    @InjectRepository(CareUnit)
    private readonly careUnitRepository: Repository<CareUnit>,
  ) {}

  //약국 4 FullData 조회
  async getAllPharmacy(
    pageNo: number = 1,
    numOfRows: number = 50,
  ): Promise<ResponseCareUnitDto[]> {
    try {
      const url = `${this.API_URL}?ServiceKey=${this.SERVICE_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}&_type=json`;

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      const text = await response.text();
      console.log('응답 내용 (첫 300자):', text.slice(0, 300));

      if (text.startsWith('<')) {
        console.error('❌ HTML/XML 응답 감지');
        throw new BadRequestException(
          'API가 XML/HTML을 반환했습니다. 실제 응답을 확인하세요.',
        );
      }

      const data = JSON.parse(text);

      const items = data.response.body.items.item;
      const pharmacies = Array.isArray(items) ? items : [items];
      console.log('처리된 약국 수:', pharmacies.length);

      return pharmacies.map(
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
    } catch (error: unknown) {
      const err = error as Error;
      console.error('❌ 에러 발생:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });
      throw new Error(`Failed to fetch pharmacy data: ${err.message}`);
    }
  }

  async findAll() {
    return this.careUnitRepository.find();
  }

  async findOne(id: string) {
    return this.careUnitRepository.findOne({ where: { id } });
  }
}
