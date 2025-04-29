import { ApiProperty } from '@nestjs/swagger';

export class ResponseReviewDto {
  @ApiProperty({
    description: '메시지',
    example: '리뷰가 성공적으로 생성되었습니다.',
  })
  message: string;

  @ApiProperty({
    description: '리뷰 ID',
  })
  reviewId: string;

  @ApiProperty({
    description: '리뷰 내용',
    example: 'string',
  })
  content: string;

  @ApiProperty({
    description: '감사 메시지',
    example: 'string',
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

  @ApiProperty({
    description: '의료기관 ID',
    example: 'string',
  })
  careUnitId: string | null;

  @ApiProperty({
    description: '의료기관 이름',
    example: 'string',
  })
  careUnitName: string | null;

  @ApiProperty({
    description: '부서 ID',
    example: 'string',
  })
  departmentId: string | null;

  @ApiProperty({
    description: '부서 이름',
    example: 'string',
  })
  departmentName: string | null;

  @ApiProperty({
    description: '생성일',
    example: 'string',
  })
  createdAt: Date;

  @ApiProperty({
    description: '유저 ID',
    example: 'string',
  })
  userId: string;

  @ApiProperty({
    description: '유저 이름',
    example: 'string',
  })
  author: string;

  @ApiProperty({
    description: '유저 닉네임',
    example: 'string',
  })
  nickname: string;
}

export class ResponseReviewsDto {
  @ApiProperty({
    description: '메시지',
    example: '리뷰가 성공적으로 조회되었습니다.',
  })
  message: string;

  @ApiProperty({
    description: '리뷰 목록',
    example: [
      {
        reviewId: 'string',
        content: 'string',
        thankMessage: 'string',
        rating: 3,
        isPublic: true,
        careUnitId: 'string',
        careUnitName: 'string',
        departmentId: 'string',
        departmentName: 'string',
        createdAt: new Date(),
        userId: 'string',
        author: 'string',
        nickname: 'string',
      },
    ],
  })
  reviews: {
    reviewId: string;
    content: string;
    thankMessage: string;
    rating: number;
    isPublic: boolean;
    careUnitId: string;
    careUnitName: string;
    departmentId: string;
    departmentName: string;
    createdAt: Date;
    userId: string;
    author: string;
    nickname: string;
  }[];

  @ApiProperty({ description: '페이지네이션' })
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
}
