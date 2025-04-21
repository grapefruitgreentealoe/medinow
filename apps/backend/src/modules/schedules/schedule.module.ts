import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleLog } from './entities/schedule-log.entity';
import { ScheduleLogService } from './services/schedule-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleLog])],
  providers: [ScheduleLogService],
  exports: [ScheduleLogService],
})
export class SchedulesModule {}
