import { Module, forwardRef } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { UsersModule } from '../users/users.module';
import { DepartmentsModule } from '../departments/departments.module';
import { CareUnitModule } from '../care-units/care-unit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    forwardRef(() => UsersModule),
    forwardRef(() => DepartmentsModule),
    forwardRef(() => CareUnitModule),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
