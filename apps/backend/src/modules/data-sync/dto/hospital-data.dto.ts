import { ApiProperty } from '@nestjs/swagger';

export class HospitalDataDto {
  @ApiProperty({ description: '공공데이터 API 병원 고유 ID' })
  externalId: string;

  @ApiProperty({ description: '병원명' })
  name: string;

  @ApiProperty({ description: '주소' })
  address: string;

  @ApiProperty({ description: '전화번호' })
  telephone: string;

  @ApiProperty({ description: '병원 종류 코드', required: false })
  typeCode?: string;

  @ApiProperty({ description: '병원 종류명', required: false })
  typeName?: string;

  @ApiProperty({ description: '위도', required: false })
  latitude?: number;

  @ApiProperty({ description: '경도', required: false })
  longitude?: number;
} 