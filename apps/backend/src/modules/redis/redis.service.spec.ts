import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constants';
import { CustomLoggerService } from '../../shared/logger/logger.service';

describe('RedisService', () => {
  let service: RedisService;
  let logger: CustomLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: REDIS_CLIENT,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
            expire: jest.fn(),
            quit: jest.fn(),
            scan: jest.fn(),
          },
        },
        CustomLoggerService,
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    logger = module.get<CustomLoggerService>(CustomLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
