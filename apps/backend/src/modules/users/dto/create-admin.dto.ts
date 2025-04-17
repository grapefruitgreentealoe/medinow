import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { CareUnitCategory } from '../../../common/enums/careUnits.enum';

export class CreateAdminDto extends CreateUserDto {
  @ApiProperty({
    type: String,
    description: '관리자 이메일',
    example: 'admin@admin.com',
    required: true,
    uniqueItems: true,
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    type: String,
    description: '관리자 비밀번호',
    example: 'Password123!',
    required: true,
    nullable: true,
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @IsOptional()
  readonly password: string;

  @ApiProperty({
    type: String,
    description: '관리자 이름',
    example: '홍길동',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    type: Number,
    description: '위도',
    example: 37.566535,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  readonly latitude: number;

  @ApiProperty({
    type: String,
    description: '경도',
    example: '126.915261',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  readonly longitude: number;

  @ApiProperty({
    type: String,
    description: '의료기관 이름',
    example: '서울대학교병원',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  readonly careUnitName: string;

  @ApiProperty({
    type: String,
    description: '의료기관 주소',
    example: '서울특별시 관악구 남부순환로 180',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  readonly careUnitAddress: string;

  @ApiProperty({
    type: CareUnitCategory,
    description: '관리자 소속 기관',
    example: CareUnitCategory.HOSPITAL,
    required: true,
    enum: CareUnitCategory,
    enumName: 'CareUnitCategory',
  })
  @IsEnum(CareUnitCategory)
  readonly careUnitCategory: CareUnitCategory;

  @ApiProperty({
    type: String,
    description: '관리자 소속 기관 사업자 번호 이미지 URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  readonly imageUrl: string;
}
