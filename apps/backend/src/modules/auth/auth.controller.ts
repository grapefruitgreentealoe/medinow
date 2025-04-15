import {
  Controller,
  Post,
  Body,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SignupResponseDto } from './dto/signup-response.dto';
import { plainToInstance } from 'class-transformer';
import { RequestOrigin } from '../../common/decorators/request-origin.decorator';
import { RequestUserId } from '../../common/decorators/request-userId.decorator';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('인증')
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
    return plainToInstance(SignupResponseDto, user);
  }

  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '로그인 성공',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '로그인 실패',
  })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @RequestOrigin() requestOrigin: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const { accessToken, accessOptions, refreshToken, refreshOptions } =
      await this.authService.login(loginDto, requestOrigin);

    response.cookie('accessToken', accessToken, accessOptions);
    response.cookie('refreshToken', refreshToken, refreshOptions);

    return plainToInstance(LoginResponseDto, {
      message: '로그인 성공',
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '로그아웃 성공',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '로그아웃 실패',
  })
  @Post('logout')
  async logout(
    @RequestUserId() userId: string,
    @Res({ passthrough: true }) response: Response,
    @RequestOrigin() requestOrigin: string,
  ) {
    await this.authService.logout(userId, requestOrigin);
    const { accessOptions, refreshOptions } =
      this.authService.expireJwtToken(requestOrigin);
    response.clearCookie('accessToken', accessOptions);
    response.clearCookie('refreshToken', refreshOptions);
    return {
      message: '로그아웃 성공',
    };
  }
}
