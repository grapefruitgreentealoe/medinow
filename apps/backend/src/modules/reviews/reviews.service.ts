import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Department } from '../departments/entities/department.entity';
import { DepartmentsService } from '../departments/departments.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private usersService: UsersService,
    private departmentsService: DepartmentsService,
  ) {}

  async createReview(createReviewDto: CreateReviewDto, user: User) {
    const findUser = await this.usersService.findUserById(user.id);
    if (!findUser) {
      throw new NotFoundException('User not found');
    }
    let department: Department;
    if (createReviewDto.departmentId) {
      // const findDepartment = await this.departmentsService(
      //   createReviewDto.departmentId,
      // );
    }
    const review = this.reviewRepository.create(createReviewDto);
    review.user = findUser;
    return this.reviewRepository.save(review);
  }
}
