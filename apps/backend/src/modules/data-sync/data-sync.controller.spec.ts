import { Test, TestingModule } from '@nestjs/testing';
import { DataSyncController } from './data-sync.controller';
import { DataSyncService } from './data-sync.service';

describe('DataSyncController', () => {
  let controller: DataSyncController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataSyncController],
      providers: [DataSyncService],
    }).compile();

    controller = module.get<DataSyncController>(DataSyncController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
