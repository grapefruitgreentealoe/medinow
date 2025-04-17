import { ApiProperty } from '@nestjs/swagger';

export class ResponseCongestionDto {
  @ApiProperty({
    description: '혼잡도 수치',
    example: 10,
  })
  hvec: number;

  @ApiProperty({
    description: '혼잡도 레벨',
    example: 'LOW',
  })
  congestionLevel: string;

  @ApiProperty({
    description: '업데이트 시간',
    example: '2021-01-01T00:00:00.000Z',
  })
  updatedAt: string;

  @ApiProperty({
    description: '기관 고유 아이디',
    example: 'a5388b7a-cd05-40a6-b9b2-af406c65ddb7',
  })
  careUnit: string;

  @ApiProperty({
    description: '기관 이름',
    example: '서울대학교병원',
  })
  name: string;
}
