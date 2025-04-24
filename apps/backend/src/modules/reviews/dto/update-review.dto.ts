import { PartialType } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @ApiProperty({
    description: '리뷰 내용',
    required: true,
    example: '리뷰 내용',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: '감사 메시지',
    required: false,
    nullable: true,
    example: '감사 메시지',
  })
  @IsString()
  @IsOptional()
  thankMessage: string;

  @ApiProperty({
    description: '평점',
    required: false,
    nullable: true,
    example: 3,
  })
  @IsNumber()
  @IsOptional()
  rating: number;

  @ApiProperty({
    description: '공개 여부',
    required: false,
    nullable: true,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPublic: boolean;

  @ApiProperty({
    description: '의료기관 ID',
    required: true,
    example: 'string',
  })
  @IsUUID()
  @IsNotEmpty()
  careUnitId: string;

  @ApiProperty({
    description: '부서 ID',
    required: false,
    nullable: true,
    example: 'string',
  })
  @IsUUID()
  @IsOptional()
  departmentId: string | null;
}
