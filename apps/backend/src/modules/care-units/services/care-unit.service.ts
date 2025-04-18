import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CareUnit } from '../entities/care-unit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Raw, Like } from 'typeorm';
import { ResponseCareUnitDto } from '../dto/response-care-unit.dto';
import { AppConfigService } from 'src/config/app/config.service';
import { UsersService } from 'src/modules/users/users.service';
import { CongestionOneService } from 'src/modules/congestion/services/congestion-one.service';

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
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => CongestionOneService))
    private readonly congestionOneService: CongestionOneService,
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

  //🏥 상세 정보 조회 by id
  async getCareUnitDetail(id: string) {
    return this.careUnitRepository.findOne({ where: { id } });
  }

  //🏥 상세 정보 조회 by hpId & category
  async getCareUnitDetailByHpid(hpId: string, category?: string) {
    if (category) {
      return this.careUnitRepository.findOne({ where: { hpId, category } });
    } else {
      return this.careUnitRepository.find({ where: { hpId } });
    }
  }

  //🏥 위치, 주소, 이름 필터 조회
  async findCareUnitByFilters(
    lat: number,
    lng: number,
    address: string,
    name: string,
    category: string,
  ) {
    if (!lat || !lng || !address || !name || !category) {
      throw new BadRequestException('입력값이 올바르지 않습니다');
    }

    const queryBuilder = this.careUnitRepository.createQueryBuilder('careUnit');

    if (lat) {
      const latPrefix = Math.floor(lat * 10) / 10;
      queryBuilder.andWhere(`CAST(careUnit.lat AS TEXT) LIKE :lat`, {
        lat: `${latPrefix}%`,
      });
    } else {
      throw new BadRequestException('위도 값이 없습니다');
    }

    if (lng) {
      const lngPrefix = Math.floor(lng * 10) / 10;
      queryBuilder.andWhere(`CAST(careUnit.lng AS TEXT) LIKE :lng`, {
        lng: `${lngPrefix}%`,
      });
    } else {
      throw new BadRequestException('경도 값이 없습니다');
    }

    if (address) {
      const addressParts = address.split(' ');
      if (addressParts.length > 1) {
        const remainingAddress = addressParts.slice(1).join(' ');
        queryBuilder.andWhere('careUnit.address LIKE :address', {
          address: `%${remainingAddress}%`,
        });
      } else {
        queryBuilder.andWhere('careUnit.address LIKE :address', {
          address: `%${address}%`,
        });
      }
    } else {
      throw new BadRequestException('주소 값이 없습니다');
    }

    if (name) {
      queryBuilder.andWhere('careUnit.name LIKE :name', {
        name: `%${name}%`,
      });
    } else {
      throw new BadRequestException('이름 값이 없습니다');
    }

    if (category) {
      queryBuilder.andWhere('careUnit.category = :category', { category });
    } else {
      throw new BadRequestException('카테고리 값이 없습니다');
    }

    const careUnits = await queryBuilder.getMany();
    if (careUnits.length === 0) {
      throw new NotFoundException('조회된 의료기관이 없습니다');
    }
    return careUnits;
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
    level: number = 1,
    category?: string,
  ): Promise<CareUnit[]> {
    const MAX_LEVEL = 5; // 최대 검색 반경 제한

    for (let currentLevel = level; currentLevel <= MAX_LEVEL; currentLevel++) {
      const queryBuilder =
        this.careUnitRepository.createQueryBuilder('careUnit');

      // 거리 계산 (필요시 Haversine 공식 등 더 정확한 계산 방식 고려)
      queryBuilder
        .where('careUnit.lat BETWEEN :minLat AND :maxLat', {
          minLat: lat - 0.005 * currentLevel,
          maxLat: lat + 0.005 * currentLevel,
        })
        .andWhere('careUnit.lng BETWEEN :minLng AND :maxLng', {
          minLng: lng - 0.005 * currentLevel,
          maxLng: lng + 0.005 * currentLevel,
        });

      if (category) {
        queryBuilder.andWhere('careUnit.category = :category', { category });
        queryBuilder.orderBy('careUnit.name', 'ASC');
      } else {
        queryBuilder
          .orderBy('careUnit.category', 'ASC')
          .addOrderBy('careUnit.name', 'ASC');
      }

      const careUnits = await queryBuilder.getMany();

      // 성능 개선: 병렬로 처리하되 에러 처리 강화
      try {
        const careUnitsWithStatus = await Promise.all(
          careUnits.map(async (careUnit) => {
            const isOpen = await this.checkNowOpen(careUnit.id);
            const user = await this.usersService
              .getUserByCareUnitId(careUnit.id)
              .catch(() => null);

            // 응급실인 경우 혼잡도 데이터도 함께 반환
            let congestionData = null;
            if (category === 'emergency' || careUnit.category === 'emergency') {
              try {
                congestionData = await this.congestionOneService
                  .getCongestion(careUnit.id)
                  .catch((error) => {
                    console.log(
                      `혼잡도 데이터 조회 실패 (${careUnit.name}): ${error.message}`,
                    );
                    return null;
                  });
              } catch (error) {
                const err = error as Error;
                console.log(
                  `혼잡도 데이터 조회 중 오류 (${careUnit.name}): ${err.message}`,
                );
              }
            }

            return {
              ...careUnit,
              now_open: isOpen,
              is_chat_available: !!user,
              congestion: congestionData,
            };
          }),
        );

        // 운영 중인 곳만 필터링
        const openCareUnits = careUnitsWithStatus.filter(
          (unit) => unit.now_open,
        );

        if (openCareUnits.length > 0) {
          return openCareUnits;
        }

        // 현재 반경에서 결과가 없으면 다음 반경으로 계속
      } catch (error) {
        console.error('의료기관 상태 확인 중 오류 발생:', error);
        throw new Error('의료기관 정보를 처리하는 중 오류가 발생했습니다.');
      }
    }

    // 최대 반경까지 검색해도 결과가 없는 경우
    console.log('해당 반경 내 운영 중인 기관이 없습니다. 위치를 이동해주세요.');
    return [];
  }

  //🏥 실시간 채팅 가능 여부 조회
  async getCareUnitIsOpen(id: string) {
    const careUnit = await this.careUnitRepository.findOne({ where: { id } });
    if (!careUnit || !careUnit.now_open) {
      throw new NotFoundException('실시간 채팅이 불가능한 기관입니다');
    }
    const user = await this.usersService.getUserByCareUnitId(careUnit.id);
    if (!user) {
      throw new NotFoundException('실시간 채팅이 불가능한 기관입니다');
    }
    return careUnit.now_open;
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
    if (day === 0) {
      open = careUnit.sundayOpen;
      close = careUnit.sundayClose;
    } else if (day === 1) {
      open = careUnit.mondayOpen;
      close = careUnit.mondayClose;
    } else if (day === 2) {
      open = careUnit.tuesdayOpen;
      close = careUnit.tuesdayClose;
    } else if (day === 3) {
      open = careUnit.wednesdayOpen;
      close = careUnit.wednesdayClose;
    } else if (day === 4) {
      open = careUnit.thursdayOpen;
      close = careUnit.thursdayClose;
    } else if (day === 5) {
      open = careUnit.fridayOpen;
      close = careUnit.fridayClose;
    } else if (day === 6) {
      open = careUnit.saturdayOpen;
      close = careUnit.saturdayClose;
    } else {
      open = careUnit.holidayOpen;
      close = careUnit.holidayClose;
    }
    const now = date.getHours() * 100 + date.getMinutes(); // 1430 형식 (14:30)
    console.log('date', date, 'now', now);
    if (open <= now && close >= now) {
      console.log('⏱️ 지금 운영 중입니다');
      careUnit.now_open = true;
      await this.careUnitRepository.save(careUnit);
      return true;
    }
    console.log('❌지금 운영 중이 아닙니다');
    careUnit.now_open = false;
    await this.careUnitRepository.save(careUnit);
    return false;
  }
}
