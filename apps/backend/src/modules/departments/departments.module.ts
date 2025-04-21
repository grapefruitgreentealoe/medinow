import { Module, forwardRef } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { Department } from './entities/department.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareUnitModule } from '../care-units/care-unit.module';
import { AppConfigModule } from 'src/config/app/config.module';
import { RedisModule } from '../redis/redis.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Department]),
    forwardRef(() => CareUnitModule),
    AppConfigModule,
    RedisModule,
  ],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
