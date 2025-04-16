import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CareUnit } from '../entities/care-unit.entity';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { AppConfigService } from 'src/config/app/config.service';
import { Cron, CronExpression } from '@nestjs/schedule';

export class CareUnitCongestionService {
  private readonly CACHE_TTL = 600;
  private readonly EMERGENCY_CONGESTION_API_URL =
    process.env.EMERGENCY_CONGESTION_API_URL;

  constructor(
    @InjectRepository(CareUnit)
    private readonly careUnitRepository: Repository<CareUnit>,
    @InjectRedis() private readonly redis: Redis,
    private readonly appConfigService: AppConfigService,
  ) {
    this.EMERGENCY_CONGESTION_API_URL =
      this.appConfigService.emergencyCongestionApiUrl;
  }

  //10분마다 실행되는 크론 작업
  @Cron(CronExpression.EVERY_10_MINUTES)
  async updateCongestion() {
    try {
      const response = await fetch(
        `${this.EMERGENCY_CONGESTION_API_URL}?serviceKey=${this.appConfigService.serviceKey}`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );
      const data = await response.json();
      const congestionData = data.response.body.items.item;

      //Redis에 데이터 저장
      for (const item of congestionData) {
        const key = `congestion:${item.careUnitId}`;
        await this.redis.set(key, item.congestion, 'EX', this.CACHE_TTL);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
