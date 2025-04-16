import { Test, TestingModule } from '@nestjs/testing';
import { CareUnitService } from './services/care-unit.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CareUnit } from './entities/care-unit.entity';
import { CareUnitAdminService } from './services/care-unit-admin.service';
import { S3Service } from '../s3/s3.service';
import { AwsConfigService } from '../../config/aws/config.service';
import { ConfigService } from '@nestjs/config';
import { AppConfigService } from '../../config/app/config.service';

describe('CareUnitService', () => {
  let service: CareUnitService;

  const mockCareUnitRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
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
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CareUnitService>(CareUnitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
