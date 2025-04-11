import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DbConfigService {
  constructor(private configService: ConfigService) {}

  get dbHost() {
    return this.configService.get('DATABASE_HOST');
  }

  get dbPort() {
    return this.configService.get('DATABASE_PORT');
  }

  get dbUsername() {
    return this.configService.get('DATABASE_USER');
  }

  get dbPassword() {
    return this.configService.get('DATABASE_PASSWORD');
  }

  get dbName() {
    return this.configService.get('DATABASE_NAME');
  }

  get dbSynchronize() {
    return this.configService.get('DATABASE_SYNCHRONIZE');
  }

  get dbLogging() {
    return this.configService.get('DATABASE_LOGGING');
  }
}
