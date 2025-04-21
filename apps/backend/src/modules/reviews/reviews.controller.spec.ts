import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { UsersService } from '../users/users.service';
import { DepartmentsService } from '../departments/departments.service';

describe('ReviewsController', () => {
  let controller: ReviewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
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
          provide: DepartmentsService,
          useFactory: () => ({
            findDepartmentById: jest.fn(),
          }),
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
