import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get jwtAccessSecret() {
    return this.configService.get<string>('app.jwtAccessSecret');
  }

  get jwtAccessExpirationTime() {
    return this.configService.get<number>('app.jwtAccessExpirationTime');
  }

  get jwtRefreshSecret() {
    return this.configService.get<string>('app.jwtRefreshSecret');
  }

  get jwtRefreshExpirationTime() {
    return this.configService.get<number>('app.jwtRefreshExpirationTime');
  }

  get port() {
    return this.configService.get<number>('app.port');
  }

  get nodeEnv() {
    return this.configService.get<string>('app.nodeEnv');
  }

  get serviceKey() {
    return this.configService.get<string>('app.serviceKey');
  }

  get emergencyApiUrl() {
    return this.configService.get<string>('app.emergencyApiUrl');
  }

  get hospitalApiUrl() {
    return this.configService.get<string>('app.hospitalApiUrl');
  }

  get pharmacyApiUrl() {
    return this.configService.get<string>('app.pharmacyApiUrl');
  }
}
