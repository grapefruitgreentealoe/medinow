import { Test, TestingModule } from '@nestjs/testing';
import { DataSyncService } from './data-sync.service';

describe('DataSyncService', () => {
  let service: DataSyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataSyncService],
    }).compile();

    service = module.get<DataSyncService>(DataSyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
