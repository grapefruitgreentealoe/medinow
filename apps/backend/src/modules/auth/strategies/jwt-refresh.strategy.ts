import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';
import { AppConfigService } from 'src/config/app/config.service';
import { JwtPayload } from '../types/jwt-payload.interface';
import { plainToInstance } from 'class-transformer';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: AppConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.Refresh,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.jwtRefreshSecret!,
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
