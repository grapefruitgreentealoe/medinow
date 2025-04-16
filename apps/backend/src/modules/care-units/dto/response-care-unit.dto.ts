import { ApiProperty } from '@nestjs/swagger';

class OperatingHours {
  @ApiProperty({ description: '개점 시간' })
  open: string;

  @ApiProperty({ description: '폐점 시간' })
  close: string;
}

export class ResponseCareUnitDto {
  @ApiProperty({ description: '약국명' })
  name: string;

  @ApiProperty({ description: '주소' })
  address: string;

  @ApiProperty({ description: '전화번호' })
  tel: string;

  @ApiProperty({ description: '기관ID' })
  hpId: string;

  @ApiProperty({ description: '위도' })
  lat: number;

  @ApiProperty({ description: '경도' })
  lng: number;

  @ApiProperty({ description: '월요일 운영시간' })
  monday: OperatingHours;

  @ApiProperty({ description: '화요일 운영시간' })
  tuesday: OperatingHours;

  @ApiProperty({ description: '수요일 운영시간' })
  wednesday: OperatingHours;

  @ApiProperty({ description: '목요일 운영시간' })
  thursday: OperatingHours;

  @ApiProperty({ description: '금요일 운영시간' })
  friday: OperatingHours;

  @ApiProperty({ description: '토요일 운영시간' })
  saturday: OperatingHours;

  @ApiProperty({ description: '일요일 운영시간' })
  sunday: OperatingHours;

  @ApiProperty({ description: '공휴일 운영시간' })
  holiday: OperatingHours;
}
