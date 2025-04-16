import {
  Controller,
  Post,
  Body,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  Res,
  UseGuards,
  UploadedFile,
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
  ApiConsumes,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { SignupResponseDto } from './dto/signup-response.dto';
import { plainToInstance } from 'class-transformer';
import { RequestOrigin } from '../../common/decorators/request-origin.decorator';
import { RequestUserId } from '../../common/decorators/request-userId.decorator';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from '../images/images.service';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly imagesService: ImagesService,
  ) {}

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
  async signup(@Body() createUserDto: CreateUserDto) {
    await this.authService.signup(createUserDto);
    return {
      message: '회원가입 성공',
    };
  }

  @ApiOperation({ summary: '관리자 회원가입' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '관리자 회원가입 성공',
  })
  @UseInterceptors(
    FileInterceptor('businessLicense', {
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
          return callback(
            new Error('이미지 또는 PDF 파일만 업로드 가능합니다.'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
      },
    }),
  )
  @Post('admin-signup')
  async adminSignup(
    @Body() createAdminDto: CreateAdminDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    await this.authService.signupAdmin(createAdminDto, file);

    return {
      message: '관리자 회원가입 성공',
    };
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
    const { accessToken, accessOptions, isAdmin } =
      await this.authService.login(loginDto, requestOrigin);

    response.cookie('accessToken', accessToken, accessOptions);

    return plainToInstance(LoginResponseDto, {
      message: '로그인 성공',
      isAdmin,
    });
  }

  @ApiCookieAuth()
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
    response.clearCookie('Refresh');
    return {
      message: '로그아웃 성공',
    };
  }
}
