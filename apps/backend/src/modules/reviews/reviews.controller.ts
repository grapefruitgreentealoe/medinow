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
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBody,
  ApiTags,
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
  @ApiOperation({ summary: '리뷰 조회' })
  @ApiOkResponse({
    description: '리뷰가 성공적으로 조회되었습니다.',
    type: ResponseReviewDto,
  })
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
  @ApiOperation({ summary: '리뷰 상세 조회' })
  @ApiOkResponse({
    description: '리뷰가 성공적으로 조회되었습니다.',
    type: ResponseReviewDto,
  })
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
  @ApiOperation({ summary: '사용자 리뷰 조회' })
  @ApiOkResponse({
    description: '사용자 리뷰가 성공적으로 조회되었습니다.',
    type: ResponseReviewDto,
  })
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
  @ApiOperation({ summary: '리뷰 수정' })
  @ApiOkResponse({
    description: '리뷰가 성공적으로 수정되었습니다.',
    type: ResponseReviewDto,
  })
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
