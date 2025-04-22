import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { ResponseFavoriteDto } from './dto/response-favorite.dto';
import { RequestUserId } from '../../common/decorators/request-userId.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ClassSerializerInterceptor,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('즐겨찾기')
// @UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: '즐겨찾기 추가/해제' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        careUnitId: { type: 'string' },
      },
    },
    examples: {
      '즐겨찾기 추가': {
        value: { careUnitId: '의료기관 ID' },
      },
      '즐겨찾기 해제': {
        value: { careUnitId: '의료기관 ID' },
      },
    },
  })
  @ApiOkResponse({
    description: '즐겨찾기 추가/해제 성공',
    type: Boolean,
    example: true,
  })
  @ApiUnauthorizedResponse({
    description: '인증 실패',
    type: Boolean,
    example: false,
  })
  @ApiNotFoundResponse({
    description: '즐겨찾기 추가/해제 실패',
    type: Boolean,
    example: false,
  })
  @Post()
  async toggleFavorite(
    @RequestUserId() userId: string,
    @Body() careUnit: { careUnitId: string },
  ) {
    return this.favoritesService.toggleFavorite(userId, careUnit.careUnitId);
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: '즐겨찾기 목록 조회' })
  @ApiOkResponse({
    description: '즐겨찾기 목록 조회 성공',
    type: ResponseFavoriteDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: '인증 실패',
  })
  @ApiNotFoundResponse({
    description: '즐겨찾기 목록 조회 실패',
    type: Array,
    example: [],
  })
  async getUserFavorites(@RequestUserId() userId: string) {
    return this.favoritesService.getUserFavorites(userId);
  }

  @Public()
  @Get(':careUnitId/check')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: '즐겨찾기 여부 확인' })
  @ApiOkResponse({
    description: '즐겨찾기 여부 확인 성공',
    type: Boolean,
    example: true,
  })
  @ApiUnauthorizedResponse({
    description: '인증 실패',
    type: Boolean,
    example: false,
  })
  @ApiNotFoundResponse({
    description: '즐겨찾기 여부 확인 실패',
    type: Boolean,
    example: false,
  })
  async checkIsFavorite(
    @RequestUserId() userId: string,
    @Param('careUnitId') careUnitId: string,
  ) {
    return this.favoritesService.checkIsFavorite(userId, careUnitId);
  }
}
