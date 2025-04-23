import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateAdminDto } from '../users/dto/create-admin.dto';
import { LoginDto } from './dto/login.dto';
import { comparePassword } from '../../common/utils/password.util';
import { CookieOptions } from 'express';
import { AppConfigService } from '../../config/app/config.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums/roles.enum';
import { CustomLoggerService } from '../../shared/logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly appConfigService: AppConfigService,
    private readonly jwtService: JwtService,
    private readonly logger: CustomLoggerService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    try {
      await this.usersService.createUser(createUserDto);
      this.logger.log(`회원가입 성공: ${createUserDto.email}`);
      return {
        message: '회원가입 성공',
      };
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`회원가입 실패: ${err.message}`);
      throw new BadRequestException('회원가입 실패');
    }
  }

  async signupAdmin(createAdminDto: CreateAdminDto) {
    try {
      await this.usersService.createAdminUser(createAdminDto);
      this.logger.log(`관리자 회원가입 성공: ${createAdminDto.email}`);
      return {
        message: '관리자 회원가입 성공',
      };
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`관리자 회원가입 실패: ${err.message}`);
      throw new BadRequestException('관리자 회원가입 실패');
    }
  }

  async login(loginDto: LoginDto, requestOrigin: string) {
    try {
      const { email, password } = loginDto;
      const user = await this.usersService.findUserByEmail(email);
      this.logger.log(`로그인 시도: ${user ? user.email + ' 성공' : '실패'}`);
      if (!user) {
        throw new UnauthorizedException(
          '이메일과 비밀번호가 일치하지 않습니다.',
        );
      }

      const isPasswordValid = await comparePassword(password, user.password!);
      this.logger.log(`비밀번호 검증: ${isPasswordValid ? '성공' : '실패'}`);
      if (!isPasswordValid) {
        throw new UnauthorizedException(
          '이메일과 비밀번호가 일치하지 않습니다.',
        );
      }

      return this.setJwtTokenBuilder(user, requestOrigin);
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`로그인 실패: ${err.message}`);
      throw new UnauthorizedException('이메일과 비밀번호가 일치하지 않습니다.');
    }
  }

  setCookieOptions(maxAge: number, requestOrigin: string): CookieOptions {
    const fullUrl = requestOrigin.includes('http')
      ? requestOrigin
      : `http://${requestOrigin}`;
    const url = new URL(fullUrl);
    const isLocalhost =
      url.hostname.includes('localhost') || url.hostname.includes('127.0.0.1');

    return {
      httpOnly: true,
      secure: true,
      maxAge,
      path: '/',
      sameSite: 'none',
    };
  }

  async setJwtAccessToken(user: User, requestOrigin: string) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const expiresIn = this.appConfigService.jwtAccessExpirationTime!;
    const maxAge = expiresIn * 1000;
    const accessOptions = this.setCookieOptions(maxAge, requestOrigin);

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.appConfigService.jwtAccessSecret,
      expiresIn,
    });

    return { accessToken, accessOptions };
  }

  async setJwtRefreshToken(user: User, requestOrigin: string) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const expiresIn = this.appConfigService.jwtRefreshExpirationTime!;
    const maxAge = expiresIn * 1000;
    const refreshOptions = this.setCookieOptions(maxAge, requestOrigin);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.appConfigService.jwtRefreshSecret,
      expiresIn,
    });
    return { refreshToken, refreshOptions };
  }

  async setJwtTokenBuilder(user: User, requestOrigin: string) {
    this.logger.log('JWT 토큰 생성 시작');
    const { accessToken, accessOptions } = await this.setJwtAccessToken(
      user,
      requestOrigin,
    );
    const { refreshToken, refreshOptions } = await this.setJwtRefreshToken(
      user,
      requestOrigin,
    );

    this.logger.log('JWT 토큰 생성 완료');
    await this.usersService.updateUserRefreshToken(user.id, refreshToken);
    this.logger.log('JWT 리프레시 토큰 업데이트 완료');
    return {
      message: '로그인 성공',
      accessToken,
      refreshToken,
      accessOptions,
      refreshOptions,
    };
  }

  async reissueJwtAccessToken(refreshToken: string, requestOrigin: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.appConfigService.jwtRefreshSecret,
      });

      const user = await this.usersService.findUserById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('토큰 불일치');
      }

      const { accessToken, accessOptions } = await this.setJwtAccessToken(
        user,
        requestOrigin,
      );

      return { accessToken, accessOptions };
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰');
    }
  }

  expireJwtToken(requestOrigin: string) {
    const accessOptions = this.setCookieOptions(0, requestOrigin);
    const refreshOptions = this.setCookieOptions(0, requestOrigin);
    this.logger.log('JWT 토큰 만료 완료');
    return {
      accessOptions,
      refreshOptions,
    };
  }

  async logout(userId: string, requestOrigin: string) {
    try {
      await this.usersService.deleteUserRefreshToken(userId);
      this.logger.log(`로그아웃 완료: ${userId}`);
      return this.expireJwtToken(requestOrigin);
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`로그아웃 실패: ${err.message}`);
      throw new BadRequestException('로그아웃 실패');
    }
  }
}
