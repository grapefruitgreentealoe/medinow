import { AppConfigService } from 'src/config/app/config.service';
import {
  NotFoundException,
  InternalServerErrorException,
  Injectable,
  Inject,
  forwardRef,
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
    @Inject(forwardRef(() => CareUnitService))
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
      // const cacheKey = `congestion:${careUnit.hpId}`;
      // const cachedData = await this.redisService.get(cacheKey);
      // if (cachedData) {
      //   console.log('캐시된 데이터:', cachedData);
      //   return JSON.parse(cachedData);
      // }
      // 캐시된 데이터가 없으면 API 호출하여 새로운 데이터 가져오기
      const response = await fetch(
        `${this.appConfigService.emergencyCongestionApiUrl}?serviceKey=${this.appConfigService.serviceKey}&hpid=${careUnit.hpId}&pageNo=1&numOfRows=1&_type=json`,
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
      const congestionDataObj = {
        hvec: Number(congestionData.hvec),
        congestionLevel: congestionLevel,
        updatedAt: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(),
        hpid: congestionData.hpid,
        name: congestionData.dutyName,
      };

      // Redis에 저장
      // await this.redisService.set(cacheKey, congestionDataObj, this.CACHE_TTL);

      // 동일한 데이터 리턴
      console.log(congestionDataObj);
      return congestionDataObj;
    } catch (error) {
      console.error('혼잡도 조회 실패:', error);
      throw new InternalServerErrorException('혼잡도 조회 실패');
    }
  }
}
