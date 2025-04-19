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
import { PaginationDto } from '../../../common/dto/pagination.dto';
import {
  PaginatedResponse,
  createPaginatedResponse,
} from '../../../common/interfaces/pagination.interface';
import { AppConfigService } from 'src/config/app/config.service';
import { UsersService } from 'src/modules/users/users.service';
import { CongestionOneService } from 'src/modules/congestion/services/congestion-one.service';
import { User } from 'src/modules/users/entities/user.entity';
import { FavoritesService } from 'src/modules/favorites/favorites.service';
import { CustomLoggerService } from 'src/shared/logger/logger.service';

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
    @Inject(forwardRef(() => FavoritesService))
    private readonly favoritesService: FavoritesService,
    private readonly logger: CustomLoggerService,
  ) {}

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

  //🏥 응급실, 병의원, 약국 반경 별 카테고리 조회  (읍,면,동 단위) -> 반환값 없으면 더 넓은 값(버튼클릭)
  async getCareUnitByCategoryAndLocation(
    paginationDto: PaginationDto,
    lat: number,
    lng: number,
    level: number = 1,
    category?: string,
    user?: User,
  ): Promise<PaginatedResponse<CareUnit>> {
    const MAX_LEVEL = 5; // 최대 검색 반경 제한
    const { page, limit } = paginationDto;
    const skip = (page ? page - 1 : 0) * (limit ? limit : 10);

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
        queryBuilder.skip(skip).take(limit);
      } else {
        queryBuilder
          .orderBy('careUnit.category', 'ASC')
          .addOrderBy('careUnit.name', 'ASC')
          .skip(skip)
          .take(limit);
      }

      const [careUnits, total] = await queryBuilder.getManyAndCount();

      // 성능 개선: 병렬로 처리하되 에러 처리 강화
      try {
        const careUnitsWithStatus = await Promise.all(
          careUnits.map(async (careUnit) => {
            const isOpen = await this.checkNowOpen(careUnit.id);
            const adminUser = await this.usersService
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

            // 사용자가 제공된 경우 즐겨찾기 정보 추가
            let isFavorite = false;
            if (user && user.id) {
              console.log(
                `즐겨찾기 확인 시작 - 사용자: ${user.id}, 병원: ${careUnit.id} (${careUnit.name})`,
              );
              try {
                isFavorite = await this.favoritesService.checkIsFavorite(
                  user.id,
                  careUnit.id,
                );
                console.log(
                  `즐겨찾기 상태: ${isFavorite ? '등록됨' : '미등록'}`,
                );
              } catch (error) {
                console.error(`즐겨찾기 확인 중 오류:`, error);
                isFavorite = false;
              }
            } else {
              console.log('사용자 정보 없음 - 즐겨찾기 확인 건너뜀');
            }

            return {
              ...careUnit,
              now_open: isOpen,
              is_chat_available: !!adminUser,
              congestion: congestionData,
              is_favorite: isFavorite,
            };
          }),
        );

        // 운영 중인 곳만 필터링
        const openCareUnits = careUnitsWithStatus.filter(
          (unit) => unit.now_open,
        );

        if (openCareUnits.length > 0) {
          return createPaginatedResponse(
            openCareUnits,
            total,
            page ? page : 1,
            limit ? limit : 10,
          );
        }

        // 현재 반경에서 결과가 없으면 다음 반경으로 계속
      } catch (error) {
        console.error('의료기관 상태 확인 중 오류 발생:', error);
        throw new Error('의료기관 정보를 처리하는 중 오류가 발생했습니다.');
      }
    }

    // 최대 반경까지 검색해도 결과가 없는 경우
    console.log('해당 반경 내 운영 중인 기관이 없습니다. 위치를 이동해주세요.');
    return createPaginatedResponse([], 0, page ? page : 1, limit ? limit : 10);
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
