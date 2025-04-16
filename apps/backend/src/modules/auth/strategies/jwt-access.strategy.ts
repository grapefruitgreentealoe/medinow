import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService } from '../../../config/app/config.service';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../types/jwt-payload.interface';
import { plainToInstance } from 'class-transformer';
import { User } from '../../users/entities/user.entity';

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
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtAccessSecret,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const { sub } = payload;
      const user = await this.usersService.findUserById(sub);
      if (!user) {
        throw new UnauthorizedException('유효하지 않은 토큰');
      }

      return plainToInstance(User, user);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '알 수 없는 오류';
      throw error;
    }
  }
}
