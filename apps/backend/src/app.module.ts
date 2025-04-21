import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { CareUnitModule } from './modules/care-units/care-unit.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
import { ImagesModule } from './modules/images/images.module';
import { S3Module } from './modules/s3/s3.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NoticesModule } from './modules/notices/notices.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { LoggerModule } from './shared/logger/logger.module';
import { CustomLoggerService } from './shared/logger/logger.service';
import { ChatsModule } from './modules/chats/chats.module';
import { ReviewsModule } from './modules/reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(typeOrmConfig.options),
    LoggerModule,
    UsersModule,
    CareUnitModule,
    AuthModule,
    RedisModule,
    S3Module,
    ImagesModule,
    DepartmentsModule,
    ScheduleModule.forRoot(),
    NoticesModule,
    FavoritesModule,
    ChatsModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    CustomLoggerService,
  ],
})
export class AppModule {}
