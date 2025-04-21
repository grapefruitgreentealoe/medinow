import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { ScheduleService } from './schedule.service';
import { CareUnitModule } from '../care-units/care-unit.module';
import { DepartmentsModule } from '../departments/departments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule]),
    CareUnitModule,
    DepartmentsModule,
  ],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class SchedulesModule {}
