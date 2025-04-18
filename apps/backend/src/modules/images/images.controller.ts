import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestUser } from '../../common/decorators/request-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('이미지')
@Controller('images')
@ApiCookieAuth()
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  // 사업자등록증 이미지 업로드
  @ApiOperation({ summary: '사업자등록증 이미지 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '사업자등록증 이미지 업로드',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '업로드할 사업자등록증 이미지',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '이미지 업로드 성공',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example:
            'https://bucket-name.s3.region.amazonaws.com/path/to/file.jpg',
        },
      },
    },
  })
  @Post('business-license/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBusinessLicense(
    @UploadedFile() file: Express.Multer.File,
    @RequestUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('이미지 파일이 없습니다.');
    }

    try {
      // 비즈니스 로직은 서비스에서 처리
      const imgUrl = await this.imagesService.uploadBusinessLicenseImage(file);

      if (!imgUrl) {
        throw new BadRequestException('이미지 업로드 실패');
      }

      // 이미지 업로드 후 사용자와 연결
      await this.imagesService.createBusinessLicenseImage(imgUrl, user);

      return { url: imgUrl };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '알 수 없는 오류';
      throw new BadRequestException(`이미지 업로드 실패: ${errorMessage}`);
    }
  }

  // 사용자 프로필 이미지 업로드
  // @ApiOperation({ summary: '사용자 프로필 이미지 업로드' })
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   description: '사용자 프로필 이미지 업로드',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       file: {
  //         type: 'string',
  //         format: 'binary',
  //         description: '업로드할 프로필 이미지',
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: '이미지 업로드 성공',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       url: {
  //         type: 'string',
  //         example:
  //           'https://bucket-name.s3.region.amazonaws.com/path/to/file.jpg',
  //       },
  //     },
  //   },
  // })
  // @Post('user-profile/upload')
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadUserProfile(@UploadedFile() file: Express.Multer.File) {
  //   if (!file) {
  //     throw new BadRequestException('이미지 파일이 없습니다.');
  //   }

  //   try {
  //     // 비즈니스 로직은 서비스에서 처리
  //     const imgUrl = await this.imagesService.uploadUserProfileImage(file);
  //     return { url: imgUrl };
  //   } catch (error: unknown) {
  //     const errorMessage =
  //       error instanceof Error ? error.message : '알 수 없는 오류';
  //     throw new BadRequestException(`이미지 업로드 실패: ${errorMessage}`);
  //   }
  // }

  // 의료기관 이미지 업로드
  // @ApiOperation({ summary: '의료기관 이미지 업로드' })
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   description: '의료기관 이미지 업로드',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       file: {
  //         type: 'string',
  //         format: 'binary',
  //         description: '업로드할 의료기관 이미지',
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: '이미지 업로드 성공',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       url: {
  //         type: 'string',
  //         example:
  //           'https://bucket-name.s3.region.amazonaws.com/path/to/file.jpg',
  //       },
  //     },
  //   },
  // })
  // @Post('care-unit/upload')
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadCareUnit(@UploadedFile() file: Express.Multer.File) {
  //   if (!file) {
  //     throw new BadRequestException('이미지 파일이 없습니다.');
  //   }

  //   try {
  //     // 비즈니스 로직은 서비스에서 처리
  //     const imgUrl = await this.imagesService.uploadCareUnitImage(file);
  //     return { url: imgUrl };
  //   } catch (error: unknown) {
  //     const errorMessage =
  //       error instanceof Error ? error.message : '알 수 없는 오류';
  //     throw new BadRequestException(`이미지 업로드 실패: ${errorMessage}`);
  //   }
  // }

  // URL로 사업자등록증 이미지 생성
  // @ApiOperation({ summary: '사업자등록증 이미지 엔티티 생성' })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       imageUrl: {
  //         type: 'string',
  //         description: '이미지 URL',
  //         example:
  //           'https://bucket-name.s3.region.amazonaws.com/path/to/file.jpg',
  //       },
  //     },
  //     required: ['imageUrl'],
  //   },
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: '이미지 엔티티 생성 성공',
  // })
  // @Post('business-license')
  // async createBusinessLicenseImage(@Body() data: { imageUrl: string }) {
  //   const { imageUrl } = data;
  //   return this.imagesService.createBusinessLicenseImage(imageUrl);
  // }

  // URL로 사용자 프로필 이미지 생성
  // @ApiOperation({ summary: '사용자 프로필 이미지 엔티티 생성' })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       imageUrl: {
  //         type: 'string',
  //         description: '이미지 URL',
  //         example:
  //           'https://bucket-name.s3.region.amazonaws.com/path/to/file.jpg',
  //       },
  //     },
  //     required: ['imageUrl'],
  //   },
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: '이미지 엔티티 생성 성공',
  // })
  // @Post('user-profile')
  // async createUserProfileImage(@Body() data: { imageUrl: string }) {
  //   const { imageUrl } = data;
  //   return this.imagesService.createUserProfileImage(imageUrl);
  // }

  // URL로 의료기관 이미지 생성
  // @ApiOperation({ summary: '의료기관 이미지 엔티티 생성' })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       imageUrl: {
  //         type: 'string',
  //         description: '이미지 URL',
  //         example:
  //           'https://bucket-name.s3.region.amazonaws.com/path/to/file.jpg',
  //       },
  //     },
  //     required: ['imageUrl'],
  //   },
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: '이미지 엔티티 생성 성공',
  // })
  // @Post('care-unit')
  // async createCareUnitImage(@Body() data: { imageUrl: string }) {
  //   const { imageUrl } = data;
  //   return this.imagesService.createCareUnitImage(imageUrl);
  // }

  // 이미지 조회
  @ApiOperation({ summary: '이미지 상세 조회' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imagesService.findById(id);
  }

  // 이미지 삭제 (관계 해제)
  @ApiOperation({ summary: '이미지 관계 해제' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imagesService.unlinkFromEntities(id);
  }
}
