import { AppConfigService } from 'src/config/app/config.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { CareUnitService } from '../../care-units/services/care-unit.service';
import { RedisService } from 'src/modules/redis/redis.service';
import { CongestionLevel } from 'src/common/enums/congestion.enum';

@Injectable()
export class CongestionTotalService implements OnModuleInit {
  private readonly CACHE_TTL = 600;

  constructor(
    private readonly redisService: RedisService,
    private readonly appConfigService: AppConfigService,
    @Inject(forwardRef(() => CareUnitService))
    private readonly careUnitService: CareUnitService,
  ) {}

  async onModuleInit() {
    setTimeout(async () => {
      await this.updateCongestion(); // 서버 시작 시 즉시 실행
    }, 5000);
  }

  //1️⃣ 전체 응급실 혼잡도 저장
  @Cron(CronExpression.EVERY_10_MINUTES)
  async updateCongestion() {
    try {
      console.log('🔄 혼잡도 업데이트 시작');
      const response = await fetch(
        `${this.appConfigService.emergencyCongestionApiUrl}?serviceKey=${this.appConfigService.serviceKey}&pageNo=1&numOfRows=600&_type=json`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );
      const data = await response.json();

      // API 응답 구조 확인을 위한 로깅
      console.log('API 응답 구조:', {
        response: !!data.response,
        body: !!data.response?.body,
        items: !!data.response?.body?.items,
        item: !!data.response?.body?.items?.item,
        fullResponse: data,
      });

      const congestionData = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      console.log(`📊 API 응답 데이터 수: ${congestionData.length}`);

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
      console.log('✅ 혼잡도 업데이트 완료');
    } catch (error) {
      console.error('❌ 혼잡도 업데이트 실패:', error);
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
