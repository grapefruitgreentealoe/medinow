import { Inject, forwardRef, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CareUnitService } from '../care-units/services/care-unit.service';
import { UsersService } from '../users/users.service';
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
    const skip = (page - 1) * limit;
    const [favorites, total] = await this.favoriteRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['careUnit', 'careUnit.departments', 'careUnit.reviews'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    if (favorites.length === 0) {
      return [];
    }

    const careUnits = favorites.map((favorite) => {
      return {
        name: favorite.careUnit.name,
        address: favorite.careUnit.address,
        favorite: true,
        departments:
          favorite.careUnit.departments.map((department) => {
            return department.name;
          }) || [],
        averageRating: favorite.careUnit.averageRating || 0,
        reviewCount: favorite.careUnit.reviews.length || 0,
      };
    });

    return {
      careUnits,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 즐겨찾기 존재 여부 확인
  async checkIsFavorite(userId: string, careUnitId: string): Promise<boolean> {
    const count = await this.favoriteRepository.count({
      where: {
        user: { id: userId },
        careUnit: { id: careUnitId },
      },
    });
    return count > 0;
  }
}
