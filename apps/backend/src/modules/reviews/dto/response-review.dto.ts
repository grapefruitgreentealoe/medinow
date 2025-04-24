import { ApiProperty } from '@nestjs/swagger';

export class ResponseReviewDto {
  @ApiProperty({
    description: '메시지',
    example: '리뷰가 성공적으로 생성되었습니다.',
  })
  message: string;
  @ApiProperty({ description: '리뷰 ID', example: 'string' })
  reviewId: string;
  @ApiProperty({ description: '리뷰 내용', example: '리뷰 내용' })
  content: string;
  @ApiProperty({
    description: '감사 메시지',
    example: '감사 메시지',
    required: false,
    nullable: true,
  })
  thankMessage: string;
  @ApiProperty({
    description: '평점',
    example: 3,
  })
  rating: number;
  @ApiProperty({
    description: '공개 여부',
    example: true,
  })
  isPublic: boolean;
  @ApiProperty({ description: '의료기관 ID', example: 'string' })
  careUnitId: string;
  @ApiProperty({
    description: '부서 ID',
    example: 'string',
    required: false,
    nullable: true,
  })
  departmentId: string | null;
}
