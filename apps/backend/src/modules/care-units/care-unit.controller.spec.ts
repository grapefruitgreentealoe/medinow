import { Test, TestingModule } from '@nestjs/testing';
import { CareUnitController } from './care-unit.controller';
import { CareUnitService } from './services/care-unit.service';
import { CareUnitAdminService } from './services/care-unit-admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CareUnit } from './entities/care-unit.entity';
import { Department } from '../departments/entities/department.entity';
import { AppConfigService } from 'src/config/app/config.service';
import { CongestionOneService } from '../congestion/services/congestion-one.service';
import { RedisService } from '../redis/redis.service';
import { CongestionTotalService } from '../congestion/services/congestion-total.service';
import { UsersService } from '../users/users.service';
import { FavoritesService } from 'src/modules/favorites/favorites.service';

describe('CareUnitController', () => {
  let controller: CareUnitController;

  const mockCareUnitService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCareUnitRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockDepartmentRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockConfigService = {
    emergencyApiUrl: 'test-url',
    hospitalApiUrl: 'test-url',
    pharmacyApiUrl: 'test-url',
    serviceKey: 'test-key',
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockUsersService = {
    getUserByCareUnitId: jest.fn().mockResolvedValue(null),
  };

  const mockCongestionOneService = {
    getCongestion: jest.fn().mockResolvedValue(null),
  };

  const mockFavoritesService = {
    // 필요한 메서드들을 여기에 추가
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CareUnitController],
      providers: [
        CareUnitService,
        CareUnitAdminService,
        CongestionOneService,
        CongestionTotalService,
        {
          provide: getRepositoryToken(CareUnit),
          useValue: mockCareUnitRepository,
        },
        {
          provide: getRepositoryToken(Department),
          useValue: mockDepartmentRepository,
        },
        {
          provide: AppConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: CongestionOneService,
          useValue: mockCongestionOneService,
        },
        {
          provide: FavoritesService,
          useValue: mockFavoritesService,
        },
      ],
    }).compile();

    controller = module.get<CareUnitController>(CareUnitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
