import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Department } from '../departments/entities/department.entity';
import { CareUnit } from '../care-units/entities/care-unit.entity';
import { DepartmentsService } from '../departments/departments.service';
import { CareUnitService } from '../care-units/services/care-unit.service';
@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private usersService: UsersService,
    private careUnitService: CareUnitService,
    private departmentsService: DepartmentsService,
  ) {}

  async createReview(createReviewDto: CreateReviewDto, user: User) {
    const findUser = await this.usersService.findUserById(user.id);

    if (!findUser) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    let findDepartment: Department | null = null;
    let findCareUnit: CareUnit | null = null;

    if (createReviewDto.departmentId) {
      findDepartment = await this.departmentsService.getDepartmentById(
        createReviewDto.departmentId,
      );
      if (!findDepartment) {
        throw new NotFoundException('진료과목을 찾을 수 없습니다.');
      }
    }

    if (createReviewDto.careUnitId) {
      findCareUnit = await this.careUnitService.getCareUnitDetail(
        createReviewDto.careUnitId,
      );
      if (!findCareUnit) {
        throw new NotFoundException('병원을 찾을 수 없습니다.');
      }
    }
    const review = this.reviewRepository.create(createReviewDto);
    review.user = findUser;
    if (findDepartment) {
      review.department = findDepartment;
    }
    if (findCareUnit) {
      review.careUnit = findCareUnit;
    }
    const savedReview = await this.reviewRepository.save(review);
    if (findCareUnit) {
      const reviewCount = await this.reviewRepository.count({
        where: { careUnit: { id: findCareUnit.id } },
      });
      await this.careUnitService.updateBadgeByReviewCount(
        findCareUnit.id,
        reviewCount,
      );
      // 평균 평점 업데이트
      await this.updateAverageRating(findCareUnit.id);
    }
    return savedReview;
  }

  async getReviewsByCareUnitId(
    careUnitId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { careUnit: { id: careUnitId } },
      relations: ['careUnit', 'department'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getReviewsByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const user = await this.usersService.findUserByIdWithRelations(userId);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const userProfile = user.userProfile;

    if (!userProfile) {
      throw new NotFoundException('사용자 프로필을 찾을 수 없습니다.');
    }

    const skip = (page - 1) * limit;

    if (userProfile.careUnit) {
      // 케어유닛이 있는 경우 해당 케어유닛의 리뷰만 반환
      const [reviews, total] = await this.reviewRepository.findAndCount({
        where: { careUnit: { id: userProfile.careUnit.id } },
        relations: ['user', 'careUnit', 'department'],
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });
      return {
        reviews,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } else {
      // 케어유닛이 없는 경우 유저가 작성한 모든 리뷰 반환
      const [reviews, total] = await this.reviewRepository.findAndCount({
        where: { user: { id: userId } },
        relations: ['user', 'careUnit', 'department'],
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });
      return {
        reviews,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }
  }

  async getReviewById(id: string) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'careUnit', 'department'],
    });
    return review;
  }

  async updateReview(id: string, updateReviewDto: UpdateReviewDto, user: User) {
    const { careUnitId, departmentId, ...updateReviewData } = updateReviewDto;
    let findDepartment: Department | null = null;
    let findCareUnit: CareUnit | null = null;

    const review = await this.getReviewById(id);
    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    if (review.user.id !== user.id) {
      throw new ForbiddenException('리뷰를 수정할 권한이 없습니다.');
    }

    if (departmentId) {
      findDepartment =
        await this.departmentsService.getDepartmentById(departmentId);
      if (!findDepartment) {
        throw new NotFoundException('진료과목을 찾을 수 없습니다.');
      }
    }

    if (careUnitId) {
      findCareUnit = await this.careUnitService.getCareUnitDetail(careUnitId);
      if (!findCareUnit) {
        throw new NotFoundException('병원을 찾을 수 없습니다.');
      }
    }

    await this.reviewRepository.update(id, updateReviewData);
    if (findCareUnit) {
      await this.updateAverageRating(findCareUnit.id);
    }
    return this.getReviewById(id);
  }

  async deleteReview(id: string, user: User) {
    const review = await this.getReviewById(id);
    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }
    if (review.user.id !== user.id) {
      throw new ForbiddenException('리뷰를 삭제할 권한이 없습니다.');
    }
    const deletedReview = await this.reviewRepository.delete(id);
    if (review.careUnit) {
      const reviewCount = await this.reviewRepository.count({
        where: { careUnit: { id: review.careUnit.id } },
      });
      await this.careUnitService.updateBadgeByReviewCount(
        review.careUnit.id,
        reviewCount,
      );
      await this.updateAverageRating(review.careUnit.id);
    }
    return deletedReview;
  }

  async updateAverageRating(careUnitId: string) {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'averageRating')
      .where('review.careUnitId = :careUnitId', { careUnitId })
      .getRawOne();

    const averageRating = result.averageRating || 0;
    await this.careUnitService.updateAverageRating(careUnitId, averageRating);
    return result;
  }
}
