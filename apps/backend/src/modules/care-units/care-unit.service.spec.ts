import { Test, TestingModule } from '@nestjs/testing';
import { CareUnitService } from './services/care-unit.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CareUnit } from './entities/care-unit.entity';
import { CareUnitAdminService } from './services/care-unit-admin.service';
import { S3Service } from '../s3/s3.service';
import { AwsConfigService } from '../../config/aws/config.service';
import { ConfigService } from '@nestjs/config';
import { AppConfigService } from '../../config/app/config.service';
import { Department } from '../departments/entities/department.entity';
import { UsersService } from '../users/users.service';
import { CongestionOneService } from '../congestion/services/congestion-one.service';
import { RedisService } from '../redis/redis.service';
import { CongestionTotalService } from '../congestion/services/congestion-total.service';
import { FavoritesService } from '../favorites/favorites.service';

describe('CareUnitService', () => {
  let service: CareUnitService;

  const mockCareUnitRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
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
      providers: [
        CareUnitService,
        CareUnitAdminService,
        S3Service,
        AwsConfigService,
        {
          provide: getRepositoryToken(CareUnit),
          useValue: mockCareUnitRepository,
        },
        {
          provide: getRepositoryToken(Department),
          useValue: mockDepartmentRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'AWS_REGION') return 'ap-northeast-2';
              if (key === 'AWS_ACCESS_KEY_ID') return 'test-key';
              if (key === 'AWS_SECRET_ACCESS_KEY') return 'test-secret';
              if (key === 'AWS_BUCKET_NAME') return 'test-bucket';
              return null;
            }),
          },
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
          provide: CongestionTotalService,
          useValue: mockCongestionOneService,
        },
        {
          provide: FavoritesService,
          useValue: mockFavoritesService,
        },
      ],
    }).compile();

    service = module.get<CareUnitService>(CareUnitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
