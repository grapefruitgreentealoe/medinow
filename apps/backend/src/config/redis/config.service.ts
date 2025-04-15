import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisConfigService {
  constructor(private configService: ConfigService) {}

  get redisHost() {
    return this.configService.get('REDIS_HOST');
  }

  get redisPort() {
    return this.configService.get('REDIS_PORT');
  }

  // 비밀번호가 있을 경우 추가
  // get redisPassword() {
  //   return this.configService.get('REDIS_PASSWORD');
  // }
}
