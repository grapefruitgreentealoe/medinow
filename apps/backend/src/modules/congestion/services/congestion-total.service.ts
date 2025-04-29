import { AppConfigService } from 'src/config/app/config.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { CareUnitService } from '../../care-units/services/care-unit.service';
import { RedisService } from 'src/modules/redis/redis.service';
import { CongestionLevel } from 'src/common/enums/congestion.enum';
import { CustomLoggerService } from 'src/shared/logger/logger.service';

@Injectable()
export class CongestionTotalService implements OnModuleInit {
  // export class CongestionTotalService {
  private readonly CACHE_TTL = 2400; // 40분 (초 단위)

  constructor(
    private readonly redisService: RedisService,
    private readonly appConfigService: AppConfigService,
    @Inject(forwardRef(() => CareUnitService))
    private readonly careUnitService: CareUnitService,
    private readonly logger: CustomLoggerService,
  ) {}

  onModuleInit() {
    setTimeout(() => {
      this.updateCongestion(); // 서버 시작 시 5초 후 실행
    }, 5000);
  }

  //1️⃣ 전체 응급실 혼잡도 저장 (30분마다 갱신)
  @Cron(CronExpression.EVERY_30_MINUTES)
  async updateCongestion(): Promise<void> {
    try {
      const response = await fetch(
        `${this.appConfigService.emergencyCongestionApiUrl}?serviceKey=${this.appConfigService.serviceKey}&pageNo=1&numOfRows=600&_type=json`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );
      const data = await response.json();

      const congestionData = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      //Redis에 데이터 저장
      for (const item of congestionData) {
        const key = `congestion:${item.hpid}`;
        const congestionLevel = this.getCongestionLevel(item.hvec);
        await this.redisService.set(
          key,
          {
            hvec: Number(item.hvec),
            congestionLevel: congestionLevel,
            updatedAt: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(),
            hpid: item.hpid,
            name: item.dutyName,
          },
          this.CACHE_TTL,
        );
      }
    } catch (error) {
      this.logger.error('❌ 혼잡도 업데이트 실패:', `${error}`);
    }
  }

  // hvec 값에 따른 혼잡도 레벨 조회
  getCongestionLevel(hvec: number) {
    if (hvec >= 10) {
      return CongestionLevel.LOW;
    } else if (hvec >= 1 && hvec <= 9) {
      return CongestionLevel.MEDIUM;
    } else {
      return CongestionLevel.HIGH;
    }
  }
}
