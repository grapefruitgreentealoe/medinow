import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisConfigModule } from '../../config/redis/config.module';
import { RedisConfigService } from '../../config/redis/config.service';
import { REDIS_CLIENT } from './redis.constants';
import { Redis } from 'ioredis';
@Module({
  imports: [RedisConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: RedisConfigService) => {
        return new Redis({
          host: configService.redisHost,
          port: configService.redisPort,
          // password: configService.redisPassword, // 비밀번호가 있을 경우 추가
        });
      },
      inject: [RedisConfigService],
    },
    RedisService,
  ],
  exports: [RedisService, REDIS_CLIENT],
})
export class RedisModule {}
