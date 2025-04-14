import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '이메일',
    required: true,
    example: 'test@test.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '비밀번호',
    required: true,
    example: 'Password123!',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
