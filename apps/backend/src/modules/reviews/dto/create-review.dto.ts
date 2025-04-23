import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: '리뷰 내용' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: '감사 메시지' })
  @IsString()
  @IsOptional()
  thankMessage: string;

  @ApiProperty({ description: '평점' })
  @IsNumber()
  @IsOptional()
  rating: number;

  @ApiProperty({ description: '공개 여부' })
  @IsBoolean()
  @IsOptional()
  isPublic: boolean;

  @ApiProperty({ description: '의료기관 ID' })
  @IsUUID()
  @IsNotEmpty()
  careUnitId: string;

  @ApiProperty({ description: '부서 ID' })
  @IsUUID()
  @IsOptional()
  departmentId: string | null;
}
