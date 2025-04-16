import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { comparePassword } from '../../common/utils/password.util';
import { CookieOptions } from 'express';
import { AppConfigService } from '../../config/app/config.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly appConfigService: AppConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
    return {
      message: '회원가입 성공',
    };
  }

  async login(loginDto: LoginDto, requestOrigin: string) {
    const user = await this.usersService.findUserByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('이메일과 비밀번호가 일치하지 않습니다.');
    }

    const isPasswordValid = await comparePassword(
      loginDto.password,
      user.password!,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일과 비밀번호가 일치하지 않습니다.');
    }
    return this.setJwtTokenBuilder(user, requestOrigin);
  }

  setCookieOptions(maxAge: number, requestOrigin: string): CookieOptions {
    const fullUrl = requestOrigin.includes('http')
      ? requestOrigin
      : `http://${requestOrigin}`;
    const url = new URL(fullUrl);
    const isLocalhost =
      url.hostname.includes('localhost') || url.hostname.includes('127.0.0.1');

    const domain = isLocalhost ? 'localhost' : url.hostname;

    return {
      httpOnly: true,
      secure: !isLocalhost,
      maxAge,
      path: '/',
      domain,
      sameSite: 'lax',
    };
  }

  async setJwtAccessToken(user: User, requestOrigin: string) {
    const payload = { sub: user.id };
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
    const payload = { sub: user.id };
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
    const { accessToken, accessOptions } = await this.setJwtAccessToken(
      user,
      requestOrigin,
    );
    const { refreshToken, refreshOptions } = await this.setJwtRefreshToken(
      user,
      requestOrigin,
    );

    await this.usersService.updateUserRefreshToken(user.id, refreshToken);
    return {
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
    return {
      accessOptions: this.setCookieOptions(0, requestOrigin),
      refreshOptions: this.setCookieOptions(0, requestOrigin),
    };
  }

  async logout(userId: string, requestOrigin: string) {
    await this.usersService.deleteUserRefreshToken(userId);
    return this.expireJwtToken(requestOrigin);
  }
}
