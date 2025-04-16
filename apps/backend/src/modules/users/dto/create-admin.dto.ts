import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  IsOptional,
  IsString,
  IsEnum,
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
    type: String,
    description: 'hpId',
    example: 'A1023456',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  readonly hpId: string;

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
}
