import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    type: String,
    description: '이메일',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  readonly email: string;

  @ApiProperty({
    type: String,
    description: '비밀번호',
    required: false,
  })
  @IsStrongPassword()
  @IsOptional()
  readonly password: string;

  @ApiProperty({
    type: String,
    description: '이름',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly name: string;

  @ApiProperty({
    type: String,
    description: '닉네임',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly nickname: string;

  @ApiProperty({
    type: String,
    description: '주소',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly address: string;

  @ApiProperty({
    type: Number,
    description: '나이',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(150)
  @IsOptional()
  readonly age: number;
}
