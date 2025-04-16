import { Test, TestingModule } from '@nestjs/testing';
import { CareUnitController } from './care-unit.controller';
import { CareUnitService } from './services/care-unit.service';
import { CareUnitAdminService } from './services/care-unit-admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CareUnit } from './entities/care-unit.entity';
import { S3Service } from '../s3/s3.service';
import { AwsConfigService } from '../../config/aws/config.service';
import { ConfigService } from '@nestjs/config';
import { AppConfigService } from '../../config/app/config.service';

describe('CareUnitController', () => {
  let controller: CareUnitController;

  const mockCareUnitRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CareUnitController],
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

    controller = module.get<CareUnitController>(CareUnitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
