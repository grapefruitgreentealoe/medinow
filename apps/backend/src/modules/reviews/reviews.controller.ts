import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { RequestUser } from 'src/common/decorators/request-user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { ResponseReviewDto } from './dto/response-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
    @RequestUser() user: User,
  ): Promise<ResponseReviewDto> {
    const review = await this.reviewsService.createReview(
      createReviewDto,
      user,
    );
    return {
      message: '리뷰가 성공적으로 생성되었습니다.',
      reviewId: review.id,
      content: review.content,
      thankMessage: review.thankMessage,
      rating: review.rating,
      isPublic: review.isPublic,
      careUnitId: review.careUnit.id,
      departmentId: review.department ? review.department.id : null,
    };
  }

  @Get()
  async getReviews(
    @Query('careUnitId') careUnitId?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    const reviews = await this.reviewsService.getReviews(
      careUnitId,
      departmentId,
    );
    return reviews.map((review) => ({
      reviewId: review.id,
      content: review.content,
      thankMessage: review.thankMessage,
      rating: review.rating,
      isPublic: review.isPublic,
      careUnitId: review.careUnit.id,
      departmentId: review.department.id,
    }));
  }

  @Get(':id')
  async getReviewById(@Param('id') id: string): Promise<ResponseReviewDto> {
    const review = await this.reviewsService.getReviewById(id);
    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }
    return {
      message: '리뷰가 성공적으로 조회되었습니다.',
      reviewId: review.id,
      content: review.content,
      thankMessage: review.thankMessage,
      rating: review.rating,
      isPublic: review.isPublic,
      careUnitId: review.careUnit.id,
      departmentId: review.department.id,
    };
  }

  @Get('user/:userId')
  async getReviewsByUserId(@Param('userId') userId: string) {
    const reviews = await this.reviewsService.getReviewsByUserId(userId);
    return {
      message: '리뷰가 성공적으로 조회되었습니다.',
      reviews: reviews.map((review) => ({
        reviewId: review.id,
        content: review.content,
        thankMessage: review.thankMessage,
        rating: review.rating,
        isPublic: review.isPublic,
        careUnitId: review.careUnit.id,
        departmentId: review.department.id,
      })),
    };
  }

  @Patch(':id')
  async updateReview(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @RequestUser() user: User,
  ): Promise<ResponseReviewDto> {
    const review = await this.reviewsService.getReviewById(id);

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    await this.reviewsService.updateReview(id, updateReviewDto, user);
    return {
      message: '리뷰가 성공적으로 수정되었습니다.',
      reviewId: review.id,
      content: review.content,
      thankMessage: review.thankMessage,
      rating: review.rating,
      isPublic: review.isPublic,
      careUnitId: review.careUnit.id,
      departmentId: review.department.id,
    };
  }

  @Delete(':id')
  async deleteReview(@Param('id') id: string, @RequestUser() user: User) {
    await this.reviewsService.deleteReview(id, user);
    return {
      message: '리뷰가 성공적으로 삭제되었습니다.',
    };
  }
}
