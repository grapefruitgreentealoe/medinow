import {
  Inject,
  forwardRef,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CareUnitService } from '../care-units/services/care-unit.service';
import { UsersService } from '../users/users.service';
import { Not, IsNull } from 'typeorm';
@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @Inject(forwardRef(() => CareUnitService))
    private readonly careUnitService: CareUnitService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  // 즐겨찾기 추가 및 해제
  async toggleFavorite(userId: string, careUnitId: string) {
    if (!userId) {
      throw new BadRequestException('로그인이 필요한 서비스입니다.');
    }
    if (!careUnitId) {
      throw new BadRequestException('즐겨찾기 추가/해제 실패');
    }
    const existingFavorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, careUnit: { id: careUnitId } },
    });

    if (existingFavorite) {
      await this.favoriteRepository.remove(existingFavorite);
      return { message: '즐겨찾기 해제' };
    }

    const newFavorite = this.favoriteRepository.create({
      user: { id: userId },
      careUnit: { id: careUnitId },
    });

    await this.favoriteRepository.save(newFavorite);
    return { message: '즐겨찾기 추가' };
  }

  // 즐겨찾기 목록 조회
  async getUserFavorites(userId: string, page: number = 1, limit: number = 10) {
    if (!userId) {
      throw new BadRequestException('로그인이 필요한 서비스입니다.');
    }
    const skip = (page - 1) * limit;
    const [favorites, total] = await this.favoriteRepository.findAndCount({
      where: {
        user: { id: userId },
        careUnit: { id: Not(IsNull()) }, // careUnit이 존재하는 경우만 조회
      },
      relations: ['careUnit', 'careUnit.departments', 'careUnit.reviews'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    if (favorites.length === 0) {
      return [];
    }

    const careUnits = await Promise.all(
      favorites.map(async (favorite) => {
        if (!favorite?.careUnit) {
          console.log('CareUnit is null or undefined');
          return null;
        }
        const adminUser = await this.usersService
          .getUserByCareUnitId(favorite.careUnit.id)
          .catch(() => null);

        return {
          id: favorite.careUnit.id,
          name: favorite.careUnit.name,
          address: favorite.careUnit.address,
          tel: favorite.careUnit.tel,
          category: favorite.careUnit.category,
          hpId: favorite.careUnit.hpId,
          mondayOpen: favorite.careUnit.mondayOpen,
          mondayClose: favorite.careUnit.mondayClose,
          tuesdayOpen: favorite.careUnit.tuesdayOpen,
          tuesdayClose: favorite.careUnit.tuesdayClose,
          wednesdayOpen: favorite.careUnit.wednesdayOpen,
          wednesdayClose: favorite.careUnit.wednesdayClose,
          thursdayOpen: favorite.careUnit.thursdayOpen,
          thursdayClose: favorite.careUnit.thursdayClose,
          fridayOpen: favorite.careUnit.fridayOpen,
          fridayClose: favorite.careUnit.fridayClose,
          saturdayOpen: favorite.careUnit.saturdayOpen,
          saturdayClose: favorite.careUnit.saturdayClose,
          sundayOpen: favorite.careUnit.sundayOpen,
          sundayClose: favorite.careUnit.sundayClose,
          holidayOpen: favorite.careUnit.holidayOpen,
          holidayClose: favorite.careUnit.holidayClose,
          lat: favorite.careUnit.lat,
          lng: favorite.careUnit.lng,
          isBadged: favorite.careUnit.isBadged,
          nowOpen: favorite.careUnit.nowOpen,
          kakaoUrl: favorite.careUnit.kakaoUrl,
          isFavorite: true,
          isChatAvailable: !!adminUser,
          averageRating: favorite.careUnit.averageRating || 0,
          reviewCount: favorite.careUnit.reviews.length || 0,
          departments:
            favorite.careUnit.departments.map((department) => {
              return { id: department.id, name: department.name };
            }) || [],
        };
      }),
    );
    // null 값을 필터링
    const filteredCareUnits = careUnits.filter((unit) => unit !== null);

    return {
      careUnits: filteredCareUnits,
      total: filteredCareUnits.length,
      page,
      totalPages: Math.ceil(filteredCareUnits.length / limit),
    };
  }

  // 즐겨찾기 존재 여부 확인
  async checkIsFavorite(userId: string, careUnitId: string): Promise<boolean> {
    if (!userId) {
      throw new BadRequestException('로그인이 필요한 서비스입니다.');
    }
    if (!careUnitId) {
      throw new BadRequestException('즐겨찾기 존재 여부 확인 실패');
    }
    const count = await this.favoriteRepository.count({
      where: {
        user: { id: userId },
        careUnit: { id: careUnitId },
      },
    });
    return count > 0;
  }
}
