import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    type: String,
    description: '이메일',
    uniqueItems: true,
    required: true,
    example: 'test@test.com',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    type: String,
    description: '비밀번호',
    required: false,
    example: 'Password123!',
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
    description: '이름',
    required: true,
    example: '홍길동',
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    type: String,
    description: '닉네임',
    uniqueItems: true,
    required: true,
    example: '홍길동',
  })
  @IsString()
  @IsNotEmpty()
  readonly nickname: string;

  @ApiProperty({
    type: String,
    description: '주소',
    required: false,
    example: '서울특별시 강남구 역삼동',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  readonly address: string;

  @ApiProperty({
    type: Number,
    description: '나이',
    required: false,
    example: 20,
    nullable: true,
  })
  @IsNumber()
  @IsOptional()
  readonly age: number;
}
