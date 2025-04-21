import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { DataSyncService } from './data-sync.service';
import { DataSyncController } from './data-sync.controller';
import { CareUnit } from '../care-units/entities/care-unit.entity';
import { Department } from '../departments/entities/department.entity';
import { SyncLog } from './entities/sync-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CareUnit, Department, SyncLog]),
    HttpModule,
  ],
  controllers: [DataSyncController],
  providers: [DataSyncService],
  exports: [DataSyncService],
})
export class DataSyncModule {}
