import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { UsersService } from '../users/users.service';
import { DepartmentsService } from '../departments/departments.service';
import { CareUnitService } from '../care-units/services/care-unit.service';
describe('ReviewsService', () => {
  let service: ReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getRepositoryToken(Review),
          useFactory: () => ({
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          }),
        },
        {
          provide: UsersService,
          useFactory: () => ({
            findUserById: jest.fn(),
          }),
        },
        {
          provide: CareUnitService, // 누락된 의존성 추가
          useFactory: () => ({
            getCareUnitDetail: jest.fn(),
          }),
        },
        {
          provide: DepartmentsService,
          useFactory: () => ({
            getDepartmentById: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
