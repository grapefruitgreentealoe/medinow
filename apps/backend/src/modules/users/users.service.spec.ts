import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { ImagesService } from '../images/images.service';
import { CareUnitService } from '../care-units/services/care-unit.service';

// 모킹된 Repository 생성
const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

// 모킹된 ImagesService 생성
const mockImagesService = {
  uploadImage: jest.fn(),
  uploadBusinessLicense: jest.fn(),
  uploadProfileImage: jest.fn(),
  findById: jest.fn(),
  deleteImage: jest.fn(),
};

// 모킹된 CareUnitService 생성
const mockCareUnitService = {
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            manager: {
              connection: {
                createQueryRunner: () => ({
                  connect: jest.fn(),
                  startTransaction: jest.fn(),
                  commitTransaction: jest.fn(),
                  rollbackTransaction: jest.fn(),
                  release: jest.fn(),
                  manager: {
                    save: jest.fn(),
                    update: jest.fn(),
                    delete: jest.fn(),
                  },
                }),
              },
            },
          },
        },
        {
          provide: getRepositoryToken(UserProfile),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ImagesService,
          useValue: mockImagesService,
        },
        {
          provide: CareUnitService,
          useValue: mockCareUnitService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
