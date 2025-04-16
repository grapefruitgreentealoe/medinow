import { Test, TestingModule } from '@nestjs/testing';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { S3Service } from '../s3/s3.service';
import { AwsConfigService } from '../../config/aws/config.service';
import { ConfigService } from '@nestjs/config';

describe('ImagesController', () => {
  let controller: ImagesController;

  const mockImageRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
      providers: [
        ImagesService,
        S3Service,
        AwsConfigService,
        {
          provide: getRepositoryToken(Image),
          useValue: mockImageRepository,
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
      ],
    }).compile();

    controller = module.get<ImagesController>(ImagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
