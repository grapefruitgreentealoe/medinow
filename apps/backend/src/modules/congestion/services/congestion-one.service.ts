import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CareUnit } from '../../care-units/entities/care-unit.entity';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { AppConfigService } from 'src/config/app/config.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  NotFoundException,
  InternalServerErrorException,
  Injectable,
} from '@nestjs/common';
import { CareUnitService } from '../../care-units/services/care-unit.service';
import { RedisService } from 'src/modules/redis/redis.service';
import { CongestionTotalService } from './congestion-total.service';

@Injectable()
export class CongestionOneService {
  private readonly CACHE_TTL = 600;

  constructor(
    private readonly redisService: RedisService,
    private readonly appConfigService: AppConfigService,
    private readonly careUnitService: CareUnitService,
    private readonly congestionTotalService: CongestionTotalService,
  ) {}

  //특정 응급실 혼잡도 조회 (careUnit의 uuid)
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
      // 캐시된 데이터가 없으면 API 호출하여 새로운 데이터 가져오기
      const response = await fetch(
        `${this.appConfigService.emergencyCongestionApiUrl}?serviceKey=${this.appConfigService.serviceKey}&pageNo=1&numOfRows=600&_type=json`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );
      const data = await response.json();
      const congestionData = data.response.body.items.item;
      const congestionLevel = this.congestionTotalService.getCongestionLevel(
        congestionData.hvec,
      );
      // Redis에 새로운 데이터 저장
      await this.redisService.set(
        cacheKey,
        {
          hvec: Number(congestionData.hvec),
          congestionLevel: congestionLevel,
          updatedAt: new Date().toISOString(),
          hpid: congestionData.hpid,
          name: congestionData.dutyName,
        },

        this.CACHE_TTL,
      );
      return {
        hvec: Number(congestionData.hvec),
        congestionLevel: congestionLevel,
        updatedAt: new Date().toISOString(),
        hpid: congestionData.hpid,
        name: congestionData.dutyName,
      };
    } catch (error) {
      console.error('혼잡도 조회 실패:', error);
      throw new InternalServerErrorException('혼잡도 조회 실패');
    }
  }
}
