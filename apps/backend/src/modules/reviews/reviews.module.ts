import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { UsersModule } from '../users/users.module';
import { DepartmentsModule } from '../departments/departments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review]), UsersModule, DepartmentsModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
