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
import { CareUnitService } from '../care-units/services/care-unit.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly appConfigService: AppConfigService,
    private readonly jwtService: JwtService,
    private readonly logger: CustomLoggerService,
    private readonly careUnitService: CareUnitService,
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
      throw new BadRequestException(err.message);
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
      throw new BadRequestException(err.message);
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

      const careUnit = await this.usersService.findUserByIdWithRelations(
        user.id,
      );

      if (!careUnit) {
        throw new UnauthorizedException('병원 정보를 찾을 수 없습니다.');
      }

      const { accessToken, refreshToken, accessOptions, refreshOptions } =
        await this.setJwtTokenBuilder(user, requestOrigin);

      return {
        message: '로그인 성공!',
        accessToken,
        refreshToken,
        accessOptions,
        refreshOptions,
        email: user.email,
        role: user.role,
        userProfile: {
          name: user.userProfile?.name,
          nickname: user.userProfile?.nickname,
          address: user.userProfile?.address,
        },
        careUnit:
          user.role === UserRole.ADMIN
            ? {
                name: careUnit.userProfile.careUnit?.name,
                address: careUnit.userProfile.careUnit?.address,
                tel: careUnit.userProfile.careUnit?.tel,
                category: careUnit.userProfile.careUnit?.category,
                mondayOpen: careUnit.userProfile.careUnit?.mondayOpen,
                mondayClose: careUnit.userProfile.careUnit?.mondayClose,
                tuesdayOpen: careUnit.userProfile.careUnit?.tuesdayOpen,
                tuesdayClose: careUnit.userProfile.careUnit?.tuesdayClose,
                wednesdayOpen: careUnit.userProfile.careUnit?.wednesdayOpen,
                wednesdayClose: careUnit.userProfile.careUnit?.wednesdayClose,
                thursdayOpen: careUnit.userProfile.careUnit?.thursdayOpen,
                thursdayClose: careUnit.userProfile.careUnit?.thursdayClose,
                fridayOpen: careUnit.userProfile.careUnit?.fridayOpen,
                fridayClose: careUnit.userProfile.careUnit?.fridayClose,
                saturdayOpen: careUnit.userProfile.careUnit?.saturdayOpen,
                saturdayClose: careUnit.userProfile.careUnit?.saturdayClose,
                sundayOpen: careUnit.userProfile.careUnit?.sundayOpen,
                sundayClose: careUnit.userProfile.careUnit?.sundayClose,
                holidayOpen: careUnit.userProfile.careUnit?.holidayOpen,
                holidayClose: careUnit.userProfile.careUnit?.holidayClose,
                isBadged: careUnit.userProfile.careUnit?.isBadged,
                nowOpen: careUnit.userProfile.careUnit?.nowOpen,
                departments: careUnit.userProfile.careUnit?.departments,
              }
            : null,
      };
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
