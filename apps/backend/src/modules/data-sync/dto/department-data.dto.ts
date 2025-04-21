import { ApiProperty } from '@nestjs/swagger';

export class DepartmentDataDto {
  @ApiProperty({ description: '공공데이터 API 부서 고유 ID' })
  externalId: string;

  @ApiProperty({ description: '병원 외부 ID' })
  hospitalExternalId: string;

  @ApiProperty({ description: '부서명' })
  name: string;

  @ApiProperty({ description: '부서 코드', required: false })
  code?: string;

  @ApiProperty({ description: '부서 분류', required: false })
  category?: string;
} 