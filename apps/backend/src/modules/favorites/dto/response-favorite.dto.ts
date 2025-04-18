import { ApiProperty } from '@nestjs/swagger';

export class ResponseFavoriteDto {
  @ApiProperty({
    description: '즐겨찾기 ID',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: '의료기관 ID',
    example: '1',
  })
  careUnitId: string;

  @ApiProperty({
    description: '의료기관 이름',
    example: '좋은 병원',
  })
  careUnitName: string;

  @ApiProperty({
    description: '의료기관 주소',
    example: '서울특별시 강남구 테헤란로 14길 6 남도빌딩 2층',
  })
  careUnitAddress: string;

  @ApiProperty({
    description: '즐겨찾기 여부',
    example: true,
  })
  favorite: boolean;
}
