// import {
//     BadRequestException,
//     Injectable,
//     NotFoundException,
//     Inject,
//     forwardRef,
//   } from '@nestjs/common';
//   import { CareUnit } from '../entities/care-unit.entity';
//   import { InjectRepository } from '@nestjs/typeorm';
//   import { Repository, Between, Raw, Like } from 'typeorm';
//   import { ResponseCareUnitDto } from '../dto/response-care-unit.dto';
//   import { PaginationDto } from '../../../common/dto/pagination.dto';
//   import {
//     PaginatedResponse,
//     createPaginatedResponse,
//   } from '../../../common/interfaces/pagination.interface';
//   import { AppConfigService } from 'src/config/app/config.service';
//   import { UsersService } from 'src/modules/users/users.service';
//   import { CongestionOneService } from 'src/modules/congestion/services/congestion-one.service';
//   import { User } from 'src/modules/users/entities/user.entity';
//   import { FavoritesService } from 'src/modules/favorites/favorites.service';
//   import { CustomLoggerService } from 'src/shared/logger/logger.service';
//   import { CareUnitCategory } from 'src/common/enums/careUnits.enum';
//   import { ExtendedCareUnit } from 'src/common/interfaces/extended-care-unit.interface';

//   @Injectable()
//   export class CareUnitService {
//     private readonly EMERGENCY_API_URL = this.appConfigService.emergencyApiUrl;
//     private readonly HOSPITAL_API_URL = this.appConfigService.hospitalApiUrl;
//     private readonly PHARMACY_API_URL = this.appConfigService.pharmacyApiUrl;
//     private readonly SERVICE_KEY = this.appConfigService.serviceKey;

//     constructor(
//       @InjectRepository(CareUnit)
//       private readonly careUnitRepository: Repository<CareUnit>,
//       private readonly appConfigService: AppConfigService,
//       @Inject(forwardRef(() => UsersService))
//       private readonly usersService: UsersService,
//       @Inject(forwardRef(() => CongestionOneService))
//       private readonly congestionOneService: CongestionOneService,
//       @Inject(forwardRef(() => FavoritesService))
//       private readonly favoritesService: FavoritesService,
//       private readonly logger: CustomLoggerService,
//     ) {}

//     //🏥 상세 정보 조회 by id
//     async getCareUnitDetail(id: string) {
//       return this.careUnitRepository.findOne({ where: { id } });
//     }

//     //🏥 상세 정보 조회 by hpId & category
//     async getCareUnitDetailByHpid(hpId: string, category?: string) {
//       if (category) {
//         return this.careUnitRepository.findOne({ where: { hpId, category } });
//       } else {
//         return this.careUnitRepository.find({ where: { hpId } });
//       }
//     }

//     //🏥 위치, 주소, 이름 필터 조회
//     async findCareUnitByFilters(
//       lat: number,
//       lng: number,
//       address: string,
//       name: string,
//       category: string,
//     ) {
//       if (!lat || !lng || !address || !name || !category) {
//         throw new BadRequestException('입력값이 올바르지 않습니다');
//       }

//       const queryBuilder = this.careUnitRepository.createQueryBuilder('careUnit');

//       if (lat) {
//         const latPrefix = Math.floor(lat * 10) / 10;
//         queryBuilder.andWhere(`CAST(careUnit.lat AS TEXT) LIKE :lat`, {
//           lat: `${latPrefix}%`,
//         });
//       } else {
//         throw new BadRequestException('위도 값이 없습니다');
//       }

//       if (lng) {
//         const lngPrefix = Math.floor(lng * 10) / 10;
//         queryBuilder.andWhere(`CAST(careUnit.lng AS TEXT) LIKE :lng`, {
//           lng: `${lngPrefix}%`,
//         });
//       } else {
//         throw new BadRequestException('경도 값이 없습니다');
//       }

//       if (address) {
//         const addressParts = address.split(' ');
//         if (addressParts.length > 1) {
//           const remainingAddress = addressParts.slice(1).join(' ');
//           queryBuilder.andWhere('careUnit.address LIKE :address', {
//             address: `%${remainingAddress}%`,
//           });
//         } else {
//           queryBuilder.andWhere('careUnit.address LIKE :address', {
//             address: `%${address}%`,
//           });
//         }
//       } else {
//         throw new BadRequestException('주소 값이 없습니다');
//       }

//       if (name) {
//         queryBuilder.andWhere('careUnit.name LIKE :name', {
//           name: `%${name}%`,
//         });
//       } else {
//         throw new BadRequestException('이름 값이 없습니다');
//       }

//       if (category) {
//         queryBuilder.andWhere('careUnit.category = :category', { category });
//       } else {
//         throw new BadRequestException('카테고리 값이 없습니다');
//       }

//       const careUnit = await queryBuilder.getOneOrFail();
//       if (!careUnit) {
//         throw new NotFoundException('조회된 의료기관이 없습니다');
//       }
//       return careUnit;
//     }

//     //🏥 상세 정보 조회 by 위치
//     async getCareUnitDetailByLocation(lat: number, lng: number) {
//       return this.careUnitRepository.find({
//         where: {
//           lat,
//           lng,
//         },
//         order: {
//           category: 'ASC',
//           name: 'ASC',
//         },
//       });
//     }

//     //🏥 응급실, 병의원, 약국 반경 별 카테고리 조회  (읍,면,동 단위) -> 반환값 없으면 더 넓은 값(버튼클릭)
//     async getCareUnitByCategoryAndLocation(
//       paginationDto: PaginationDto,
//       lat: number,
//       lng: number,
//       level: number = 1,
//       OpenStatus: boolean = true,
//       category?: string,
//       user?: User,
//     ): Promise<PaginatedResponse<ExtendedCareUnit>> {
//       const { page, limit } = paginationDto;
//       const skip = (page ? page - 1 : 0) * (limit ? limit : 10);

//       this.logger.log(
//         `getCareUnitByCategoryAndLocation 호출 - 페이지: ${page}, 제한: ${limit}, 위도: ${lat}, 경도: ${lng}, 레벨: ${level}, 카테고리: ${category}, 운영 중 필터링: ${OpenStatus}`,
//       );

//       const queryBuilder = this.careUnitRepository.createQueryBuilder('careUnit');

//       // 거리 계산을 위한 서브쿼리 추가
//       queryBuilder.addSelect(
//         `POWER(careUnit.lat - :lat, 2) + POWER(careUnit.lng - :lng, 2)`,
//         'distance',
//       );

//       // 거리 계산 (필요시 Haversine 공식 등 더 정확한 계산 방식 고려)
//       queryBuilder
//         .where('careUnit.lat BETWEEN :minLat AND :maxLat', {
//           minLat: lat - 0.005 * level,
//           maxLat: lat + 0.005 * level,
//         })
//         .andWhere('careUnit.lng BETWEEN :minLng AND :maxLng', {
//           minLng: lng - 0.005 * level,
//           maxLng: lng + 0.005 * level,
//         })
//         .setParameters({ lat, lng });

//       // 카테고리 필터링
//       if (category) {
//         queryBuilder.andWhere('careUnit.category = :category', { category });
//       }

//       // 모든 데이터 조회 (페이지네이션 전)
//       const allCareUnits = await queryBuilder
//         .leftJoinAndSelect('careUnit.departments', 'departments')
//         .getMany();

//       // 운영 상태 확인 및 추가 정보 조회
//       const careUnitsWithStatus = await Promise.all(
//         allCareUnits.map(async (careUnit) => {
//           // 운영 상태, 즐겨찾기, 관리자 정보 확인
//           const [isOpen, adminUser, isFavorite] = await Promise.all([
//             this.checkNowOpen(careUnit.id),
//             this.usersService.getUserByCareUnitId(careUnit.id).catch(() => null),
//             user?.id
//               ? this.favoritesService
//                   .checkIsFavorite(user.id, careUnit.id)
//                   .catch(() => false)
//               : Promise.resolve(false),
//           ]);

//           // 거리 계산
//           const distance =
//             Math.pow(careUnit.lat - lat, 2) + Math.pow(careUnit.lng - lng, 2);

//           // 응급실인 경우 혼잡도 정보 조회
//           // let congestion = null;
//           // if (careUnit.category === 'emergency' || category === 'emergency') {
//           //   try {
//           //     congestion = await this.congestionOneService.getCongestion(
//           //       careUnit.id,
//           //     );
//           //   } catch (error) {
//           //     const err = error as Error;
//           //     this.logger.error(
//           //       `혼잡도 데이터 조회 실패 (${careUnit.name}): ${err.message}`,
//           //     );
//           //   }
//           // }

//           return {
//             ...careUnit,
//             nowOpen: isOpen,
//             isChatAvailable: !!adminUser,
//             isFavorite,
//             departments: careUnit.departments || [],
//             distance,
//             // congestion,
//           };
//         }),
//       );

//       // 필터링 (운영중만 보기)
//       const filteredUnits = OpenStatus
//         ? careUnitsWithStatus.filter((unit) => unit.nowOpen)
//         : careUnitsWithStatus;

//       // 7. 정렬 (요구사항에 따라)
//       filteredUnits.sort((a, b) => {
//         // 로그인 사용자: 즐겨찾기 > 배지 > (운영중) > 거리
//         if (user) {
//           // 즐겨찾기 비교
//           if (a.isFavorite !== b.isFavorite) {
//             return a.isFavorite ? -1 : 1;
//           }
//           // 배지 비교
//           if (a.isBadged !== b.isBadged) {
//             return a.isBadged ? -1 : 1;
//           }
//           // 운영중 필터가 꺼져있을 때만 운영 상태로 정렬
//           if (!OpenStatus && a.nowOpen !== b.nowOpen) {
//             return a.nowOpen ? -1 : 1;
//           }
//           // 거리 비교
//           return a.distance - b.distance;
//         }
//         // 비로그인 사용자: 배지 > (운영중) > 거리
//         else {
//           // 배지 비교
//           if (a.isBadged !== b.isBadged) {
//             return a.isBadged ? -1 : 1;
//           }
//           // 운영중 필터가 꺼져있을 때만 운영 상태로 정렬
//           if (!OpenStatus && a.nowOpen !== b.nowOpen) {
//             return a.nowOpen ? -1 : 1;
//           }
//           // 거리 비교
//           return a.distance - b.distance;
//         }
//       });
//       // 페이지네이션 적용
//       const paginatedUnits = filteredUnits
//         .slice(skip, skip + (limit || 10))
//         .map(({ distance, ...unit }) => unit); // distance 제거
//       return createPaginatedResponse(
//         paginatedUnits,
//         filteredUnits.length,
//         page || 1,
//         limit || 10,
//       );
//     }

//     //🏥 실시간 채팅 가능 여부 조회
//     async getCareUnitIsOpen(id: string) {
//       const careUnit = await this.careUnitRepository.findOne({ where: { id } });
//       if (!careUnit || !careUnit.nowOpen) {
//         throw new NotFoundException('실시간 채팅이 불가능한 기관입니다');
//       }
//       const user = await this.usersService.getUserByCareUnitId(careUnit.id);
//       if (!user) {
//         throw new NotFoundException('실시간 채팅이 불가능한 기관입니다');
//       }
//       return careUnit.nowOpen;
//     }

//     // 수동 뱃지 기능 주석처리
//     // // 💫배지 추가
//     // async addBadge(id: string) {
//     //   // 감사 기능 구현 후 감사 수에 따른 자동 배치 추가 필요
//     //   const careUnit = await this.careUnitRepository.findOne({ where: { id } });
//     //   if (!careUnit) {
//     //     throw new NotFoundException('Care unit not found');
//     //   }
//     //   careUnit.isBadged = true;
//     //   await this.careUnitRepository.save(careUnit);
//     //   console.log('💫배지 추가 완료');
//     //   return careUnit;
//     // }

//     // // 💫배지 제거
//     // async removeBadge(id: string) {
//     //   const careUnit = await this.careUnitRepository.findOne({ where: { id } });
//     //   if (!careUnit) {
//     //     throw new NotFoundException('Care unit not found');
//     //   }
//     //   careUnit.isBadged = false;
//     //   await this.careUnitRepository.save(careUnit);
//     //   console.log('💫배지 제거 완료');
//     //   return careUnit;
//     // }

//     // 💫리뷰 수에 따른 배지 상태 업데이트
//     async updateBadgeByReviewCount(id: string, reviewCount: number) {
//       const careUnit = await this.careUnitRepository.findOne({ where: { id } });
//       if (!careUnit) {
//         throw new NotFoundException('의료기관을 찾을 수 없습니다');
//       }

//       const BADGE_THRESHOLD = 5; // 배지 부여 기준 리뷰 수

//       if (reviewCount >= BADGE_THRESHOLD && !careUnit.isBadged) {
//         // 리뷰 수가 기준 이상이고 배지가 없는 경우 배지 추가
//         careUnit.isBadged = true;
//         await this.careUnitRepository.save(careUnit);
//         this.logger.log(
//           `의료기관 ${careUnit.name}에 리뷰 ${reviewCount}개로 배지 추가 완료`,
//         );
//       } else if (reviewCount < BADGE_THRESHOLD && careUnit.isBadged) {
//         // 리뷰 수가 기준 미만이고 배지가 있는 경우 배지 제거
//         careUnit.isBadged = false;
//         await this.careUnitRepository.save(careUnit);
//         this.logger.log(
//           `의료기관 ${careUnit.name}의 리뷰 ${reviewCount}개로 배지 제거 완료`,
//         );
//       }

//       return careUnit;
//     }

//     // ⏱️실시간 운영 여부 (프론트에서 호버 하면 좌표로 조회, 상세조회시에도)
//     async checkNowOpen(id: string) {
//       const careUnit = await this.careUnitRepository.findOne({ where: { id } });
//       if (!careUnit) {
//         throw new NotFoundException('Care unit not found');
//       }
//       let open;
//       let close;
//       const date = new Date();
//       const day = date.getDay();
//       if (day === 0) {
//         open = careUnit.sundayOpen;
//         close = careUnit.sundayClose;
//       } else if (day === 1) {
//         open = careUnit.mondayOpen;
//         close = careUnit.mondayClose;
//       } else if (day === 2) {
//         open = careUnit.tuesdayOpen;
//         close = careUnit.tuesdayClose;
//       } else if (day === 3) {
//         open = careUnit.wednesdayOpen;
//         close = careUnit.wednesdayClose;
//       } else if (day === 4) {
//         open = careUnit.thursdayOpen;
//         close = careUnit.thursdayClose;
//       } else if (day === 5) {
//         open = careUnit.fridayOpen;
//         close = careUnit.fridayClose;
//       } else if (day === 6) {
//         open = careUnit.saturdayOpen;
//         close = careUnit.saturdayClose;
//       } else {
//         open = careUnit.holidayOpen;
//         close = careUnit.holidayClose;
//       }
//       const now = date.getHours() * 100 + date.getMinutes(); // 1430 형식 (14:30)
//       console.log('date', date, 'now', now);
//       if (open <= now && close >= now) {
//         console.log('⏱️ 지금 운영 중입니다');
//         careUnit.nowOpen = true;
//         await this.careUnitRepository.save(careUnit);
//         return true;
//       }
//       console.log('❌지금 운영 중이 아닙니다');
//       careUnit.nowOpen = false;
//       await this.careUnitRepository.save(careUnit);
//       return false;
//     }

//     // careUnit을 hpId와 카테고리로 조회하여 가져오기 (department 조회 시 사용)
//     async getHospitalCareUnit(hpId: string, category: string) {
//       return this.careUnitRepository.findOne({
//         where: { hpId: hpId, category },
//       });
//     }
//   }
