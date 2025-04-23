import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsService } from './departments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { AppConfigService } from 'src/config/app/config.service';
import { CustomLoggerService } from 'src/shared/logger/logger.service';
import { CareUnitService } from '../care-units/services/care-unit.service';
import { RedisService } from '../redis/redis.service';

describe('DepartmentsService', () => {
  let service: DepartmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        {
          provide: getRepositoryToken(Department),
          useValue: {},
        },
        {
          provide: AppConfigService,
          useValue: {
            serviceKey: 'test-key',
            hospitalBasicApiUrl: 'http://test-url',
          },
        },
        {
          provide: CustomLoggerService,
          useValue: {},
        },
        {
          provide: CareUnitService,
          useValue: {},
        },
        {
          provide: RedisService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
