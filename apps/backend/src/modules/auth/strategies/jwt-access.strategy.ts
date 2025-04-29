import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService } from '../../../config/app/config.service';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../types/jwt-payload.interface';
import { plainToInstance } from 'class-transformer';
import { User } from '../../users/entities/user.entity';
import { Request } from 'express';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly usersService: UsersService,
  ) {
    const jwtAccessSecret = appConfigService.jwtAccessSecret;

    if (!jwtAccessSecret) {
      throw new Error('JWT Access Secret is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // 쿠키에서 토큰 추출
          if (request?.cookies?.accessToken) {
            return request.cookies.accessToken;
          }

          // Authorization 헤더에서 토큰 추출
          const authHeader = request?.headers?.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
          }

          // WebSocket 연결에서 토큰 추출
          if ((request as any)?.handshake?.query?.token) {
            try {
              const socketToken = JSON.parse(
                (request as any).handshake.query.token as string,
              );
              return socketToken?.accessToken || null;
            } catch (error) {
              return null;
            }
          }

          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtAccessSecret,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const { sub, email, role } = payload;

      // 기본적으로 DB에서 사용자 확인 (보안상 더 안전)
      const user = await this.usersService.findUserById(sub);
      if (!user || user.email !== email || user.role !== role) {
        throw new UnauthorizedException('유효하지 않은 토큰');
      }

      // 토큰에서 가져온 role과 DB의 role이 다르면 오류 (토큰 조작 방지)
      if (user.role !== role) {
        throw new UnauthorizedException(
          '권한이 변경되었습니다. 다시 로그인하세요.',
        );
      }

      return plainToInstance(User, user);
    } catch (error: any) {
      const err = error as Error;
      throw new UnauthorizedException(err.message);
    }
  }
}
