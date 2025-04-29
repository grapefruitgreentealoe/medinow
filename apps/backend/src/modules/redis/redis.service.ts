import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
import { CustomLoggerService } from '../../shared/logger/logger.service';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly logger: CustomLoggerService,
  ) {}

  async set(key: string, value: any, ttl?: number) {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await this.redis.set(key, stringValue, 'EX', ttl);
      } else {
        await this.redis.set(key, stringValue);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error('Redis 설정 실패:', err.message);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      const err = error as Error;
      this.logger.error('Redis 조회 실패:', err.message);
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.redis.del(key);
    } catch (error) {
      const err = error as Error;
      this.logger.error('Redis 삭제 실패:', err.message);
      throw error;
    }
  }

  async expire(key: string, ttl: number): Promise<number> {
    try {
      return await this.redis.expire(key, ttl);
    } catch (error) {
      const err = error as Error;
      this.logger.error('Redis 만료 실패:', err.message);
      throw error;
    }
  }

  async close() {
    try {
      await this.redis.quit();
    } catch (error) {
      const err = error as Error;
      this.logger.error('Redis 종료 실패:', err.message);
      throw error;
    }
  }

  async scan(pattern: string, count: number = 1000): Promise<string[]> {
    try {
      const keys: string[] = [];
      let cursor = '0';

      do {
        const [nextCursor, results] = await this.redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          count,
        );
        cursor = nextCursor;
        keys.push(...results);
      } while (cursor !== '0');

      return keys;
    } catch (error) {
      const err = error as Error;
      this.logger.error('Redis 스캔 실패:', err.message);
      throw error;
    }
  }
}
