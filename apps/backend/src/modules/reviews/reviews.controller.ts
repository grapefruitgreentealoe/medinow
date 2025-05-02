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
    return await this.reviewsService.createReview(createReviewDto, user);
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
    return await this.reviewsService.getReviewsByUserId(userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '리뷰 상세 조회' })
  @ApiOkResponse({
    description: '리뷰가 성공적으로 조회되었습니다.',
    type: ResponseReviewDto,
  })
  async getReviewById(@Param('id') id: string) {
    return await this.reviewsService.getReviewById(id);
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
    return await this.reviewsService.updateReview(id, updateReviewDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: '리뷰 삭제' })
  @ApiOkResponse({
    description: '리뷰가 성공적으로 삭제되었습니다.',
  })
  async deleteReview(@Param('id') id: string, @RequestUser() user: User) {
    return await this.reviewsService.deleteReview(id, user);
  }
}
