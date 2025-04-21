import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: '리뷰 내용' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: '감사 메시지' })
  @IsString()
  @IsNotEmpty()
  thankMessage: string;

  @ApiProperty({ description: '평점' })
  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @ApiProperty({ description: '공개 여부' })
  @IsBoolean()
  @IsNotEmpty()
  isPublic: boolean;

  @ApiProperty({ description: '의료기관 ID' })
  @IsUUID()
  @IsNotEmpty()
  careUnitId: string;

  @ApiProperty({ description: '부서 ID' })
  @IsUUID()
  @IsNotEmpty()
  departmentId: string;
}
