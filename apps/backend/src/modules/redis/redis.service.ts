import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async set(key: string, value: any, ttl?: number) {
    const stringValue = JSON.stringify(value);
    if (ttl) {
      await this.redis.set(key, stringValue, 'EX', ttl);
    } else {
      await this.redis.set(key, stringValue);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async del(key: string): Promise<number> {
    return await this.redis.del(key);
  }

  async expire(key: string, ttl: number): Promise<number> {
    return await this.redis.expire(key, ttl);
  }

  async close() {
    await this.redis.quit();
  }

  async scan(pattern: string, count: number = 1000): Promise<string[]> {
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
  }
}
