import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareUnitController } from './care-unit.controller';
import { CareUnitService } from './services/care-unit.service';
import { CareUnit } from './entities/care-unit.entity';
import { CareUnitAdminService } from './services/care-unit-admin.service';
import { AppConfigModule } from 'src/config/app/config.module';
import { Department } from 'src/modules/departments/entities/department.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '../redis/redis.module';
import { CongestionModule } from '../congestion/congestion.module';
import { UsersModule } from '../users/users.module';
import { FavoritesModule } from '../favorites/favorites.module';
import { DepartmentsModule } from '../departments/departments.module';
import { Favorite } from '../favorites/entities/favorite.entity';
import { ReviewsModule } from '../reviews/reviews.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([CareUnit, Department, Favorite]),
    AppConfigModule,
    RedisModule,
    ScheduleModule.forRoot(),
    forwardRef(() => UsersModule),
    forwardRef(() => CongestionModule),
    forwardRef(() => FavoritesModule),
    forwardRef(() => DepartmentsModule),
    forwardRef(() => ReviewsModule),

  ],
  controllers: [CareUnitController],
  providers: [CareUnitService, CareUnitAdminService],
  exports: [CareUnitService, CareUnitAdminService],
})
export class CareUnitModule {}
