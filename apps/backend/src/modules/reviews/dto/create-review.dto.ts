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
  @ApiProperty({
    description: '리뷰 내용',
    example: '리뷰 내용',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: '감사 메시지',
    example: '감사 메시지',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  thankMessage: string;

  @ApiProperty({
    description: '평점',
    example: 3,
    required: false,
    nullable: true,
  })
  @IsNumber()
  @IsOptional()
  rating: number;

  @ApiProperty({
    description: '공개 여부',
    example: true,
    required: false,
    nullable: true,
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
