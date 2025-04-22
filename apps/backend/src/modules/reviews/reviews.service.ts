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
    }
    return savedReview;
  }

  async getReviews(careUnitId?: string, departmentId?: string) {
    const reviews = await this.reviewRepository.find({
      where: {
        ...(careUnitId ? { careUnit: { id: careUnitId } } : {}),
        ...(departmentId ? { department: { id: departmentId } } : {}),
      },
      relations: ['user', 'careUnit', 'department'],
    });
    return reviews;
  }

  async getReviewById(id: string) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'careUnit', 'department'],
    });
    return review;
  }

  async getReviewsByUserId(userId: string) {
    const reviews = await this.reviewRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'careUnit', 'department'],
    });
    return reviews;
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

    return this.reviewRepository.update(id, updateReviewData);
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
    }
    return deletedReview;
  }
}
