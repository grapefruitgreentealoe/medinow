import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { comparePassword } from 'src/common/utils/password.util';
import { CookieOptions } from 'express';
import { AppConfigService } from 'src/config/app/config.service';
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
    return user;
  }

  async login(loginDto: LoginDto, requestOrigin: string) {
    const user = await this.usersService.findUserByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await comparePassword(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }
    return this.setJwtTokenBuilder(user, requestOrigin);
  }

  setCookieOptions(maxAge: number, requestOrigin: string): CookieOptions {
    const url = new URL(requestOrigin);
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
    const { accessToken, accessOptions } = await this.setJwtAccessToken(
      user,
      requestOrigin,
    );
    const { refreshToken, refreshOptions } = await this.setJwtRefreshToken(
      user,
      requestOrigin,
    );
    return {
      accessToken,
      refreshToken,
      accessOptions,
      refreshOptions,
    };
  }

  expireJwtToken(requestOrigin: string) {
    return {
      accessOptions: this.setCookieOptions(0, requestOrigin),
      refreshOptions: this.setCookieOptions(0, requestOrigin),
    };
  }
}
