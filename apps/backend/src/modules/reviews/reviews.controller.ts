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
import { RequestUserId } from '../../common/decorators/request-userId.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { ResponseReviewDto } from './dto/response-review.dto';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBody,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('리뷰')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: '리뷰 생성' })
  @ApiBody({ type: CreateReviewDto })
  @ApiCreatedResponse({
    description: '리뷰가 성공적으로 생성되었습니다.',
    type: ResponseReviewDto,
  })
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
    @RequestUser() user: User,
  ) {
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
      departmentId: review.department ? review.department.id : null,
    };
  }

  @Get()
  @ApiOperation({
    summary: '리뷰 조회',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    description: '리뷰가 성공적으로 조회되었습니다.',
    type: ResponseReviewDto,
  })
  async getReviews(
    @RequestUserId() userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const { reviews, total, totalPages } =
      await this.reviewsService.getReviewsByUserId(userId, page, limit);
    return {
      message: '리뷰가 성공적으로 조회되었습니다.',
      reviews: reviews.map((review) => ({
        reviewId: review.id,
        content: review.content,
        thankMessage: review.thankMessage,
        rating: review.rating,
        isPublic: review.isPublic,
        careUnitName: review.careUnit?.name,
        departmentName: review.department?.name,
      })),
      pagination: {
        total,
        page,
        totalPages,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '리뷰 상세 조회' })
  @ApiOkResponse({
    description: '리뷰가 성공적으로 조회되었습니다.',
    type: ResponseReviewDto,
  })
  async getReviewById(@Param('id') id: string) {
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
      careUnitName: review.careUnit.name,
      departmentName: review.department.name,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '리뷰 수정' })
  @ApiOkResponse({
    description: '리뷰가 성공적으로 수정되었습니다.',
  })
  async updateReview(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @RequestUser() user: User,
  ) {
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
      careUnitName: review.careUnit.name,
      departmentName: review.department.name,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '리뷰 삭제' })
  @ApiOkResponse({
    description: '리뷰가 성공적으로 삭제되었습니다.',
  })
  async deleteReview(@Param('id') id: string, @RequestUser() user: User) {
    await this.reviewsService.deleteReview(id, user);
    return {
      message: '리뷰가 성공적으로 삭제되었습니다.',
    };
  }
}
