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
import { CreateAdminDto } from '../users/dto/create-admin.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { SignupResponseDto } from './dto/signup-response.dto';
import { plainToInstance } from 'class-transformer';
import { RequestOrigin } from '../../common/decorators/request-origin.decorator';
import { RequestUserId } from '../../common/decorators/request-userId.decorator';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ImagesService } from '../images/images.service';
import { Public } from './decorators/public.decorator';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly imagesService: ImagesService,
  ) {}

  @Public()
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: '회원가입 성공',
    type: SignupResponseDto,
  })
  @ApiBadRequestResponse({
    description: '회원가입 실패',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    await this.authService.signup(createUserDto);
    return {
      message: '회원가입 성공',
    };
  }

  @Public()
  @ApiOperation({ summary: '관리자 회원가입' })
  @ApiBody({ type: CreateAdminDto })
  @ApiCreatedResponse({
    description: '관리자 회원가입 성공',
  })
  @Post('admin-signup')
  async adminSignup(@Body() createAdminDto: CreateAdminDto) {
    await this.authService.signupAdmin(createAdminDto);

    return {
      message: '관리자 회원가입 성공',
    };
  }

  @Public()
  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: '로그인 성공',
  })
  @ApiBadRequestResponse({
    description: '로그인 실패',
  })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @RequestOrigin() requestOrigin: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const login = await this.authService.login(loginDto, requestOrigin);

    response.cookie('accessToken', login.accessToken, login.accessOptions);

    return plainToInstance(LoginResponseDto, {
      message: '로그인 성공',
      email: login.email,
      role: login.role,
      userProfile: {
        name: login.userProfile?.name,
        nickname: login.userProfile?.nickname,
        address: login.userProfile?.address,
      },
      careUnit: login.careUnit ? login.careUnit : null,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '로그아웃' })
  @ApiOkResponse({
    description: '로그아웃 성공',
  })
  @ApiBadRequestResponse({
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
    response.clearCookie('Refresh');
    return {
      message: '로그아웃 성공',
    };
  }
}
