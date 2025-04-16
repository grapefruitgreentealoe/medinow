import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';
import { AppConfigService } from '../../../config/app/config.service';
import { JwtPayload } from '../types/jwt-payload.interface';
import { plainToInstance } from 'class-transformer';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly usersService: UsersService,
  ) {
    const jwtRefreshSecret = appConfigService.jwtRefreshSecret;

    if (!jwtRefreshSecret) {
      throw new Error('JWT Refresh Secret is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtRefreshSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const { sub } = payload;
    const user = await this.usersService.findUserById(sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    return plainToInstance(User, user);
  }
}
