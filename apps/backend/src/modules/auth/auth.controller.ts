import {
  Controller,
  Post,
  Body,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { SignupResponseDto } from './dto/signup.response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '회원가입 성공',
    type: SignupResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '회원가입 실패',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signup')
  async signup(
    @Body() createUserDto: CreateUserDto,
  ): Promise<SignupResponseDto> {
    const user = await this.authService.signup(createUserDto);
    return plainToInstance(SignupResponseDto, {
      message: '회원가입 성공',
      user,
    });
  }
}
