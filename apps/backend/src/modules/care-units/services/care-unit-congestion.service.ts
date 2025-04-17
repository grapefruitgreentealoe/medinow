import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CareUnit } from '../entities/care-unit.entity';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { AppConfigService } from 'src/config/app/config.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  NotFoundException,
  InternalServerErrorException,
  Injectable,
} from '@nestjs/common';
import { CareUnitService } from './care-unit.service';
import { RedisService } from 'src/modules/redis/redis.service';
import { CongestionLevel } from 'src/common/enums/congestion.enum';

@Injectable()
export class CareUnitCongestionService {
  private readonly CACHE_TTL = 600;

  constructor(
    @InjectRepository(CareUnit)
    private readonly redisService: RedisService,
    private readonly appConfigService: AppConfigService,
    private readonly careUnitService: CareUnitService,
  ) {}

  //1️⃣ 전체 응급실 혼잡도 저장
  @Cron(CronExpression.EVERY_10_MINUTES)
  async updateCongestion() {
    try {
      const response = await fetch(
        `${this.appConfigService.emergencyCongestionApiUrl}?serviceKey=${this.appConfigService.serviceKey}`,
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
        const key = `congestion:${item.careUnitId}`;
        const congestionLevel = await this.getCongestionLevel(item.hvec);
        await this.redisService.set(
          key,
          {
            hvec: Number(item.hvec),
            congestionLevel: congestionLevel,
            updatedAt: new Date().toISOString(),
          },
          this.CACHE_TTL,
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  //2️⃣ 특정 응급실 혼잡도 조회 (careUnit의 uuid)
  async getCongestion(careUnitId: string) {
    try {
      // 먼저 CareUnit 조회
      const careUnit = await this.careUnitService.getCareUnitDetail(careUnitId);
      if (!careUnit) {
        throw new NotFoundException('CareUnit not found');
      }
      // Redis에서 캐시된 혼잡도 데이터 조회
      const cacheKey = `congestion:${careUnit.id}`;
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      // 캐시된 데이터가 없으면 API 호출하여 새로운 데이터 가져오기. fetch 키 확인필요요
      const response = await fetch(
        `${this.appConfigService.emergencyCongestionApiUrl}?serviceKey=${this.appConfigService.serviceKey}&HPID=${careUnit.hpId}`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );
      const data = await response.json();
      const congestionData = data.response.body.items.item;
      const congestionLevel = await this.getCongestionLevel(
        congestionData.hvec,
      );
      // Redis에 새로운 데이터 저장
      await this.redisService.set(
        cacheKey,
        {
          hvec: Number(congestionData.hvec),
          congestionLevel: congestionLevel,
          updatedAt: new Date().toISOString(),
        },

        this.CACHE_TTL,
      );
      return {
        hvec: congestionData.hvec,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('혼잡도 조회 실패:', error);
      throw new InternalServerErrorException('혼잡도 조회 실패');
    }
  }

  //3️⃣ hvec 값에 따른 혼잡도 레벨 조회
  async getCongestionLevel(hvec: number) {
    if (hvec >= 10) {
      return CongestionLevel.LOW;
    } else if (hvec >= 1 && hvec <= 9) {
      return CongestionLevel.MEDIUM;
    } else {
      return CongestionLevel.HIGH;
    }
  }
}
