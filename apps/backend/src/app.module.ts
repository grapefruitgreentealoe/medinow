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
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '/app/.env' : '.env.local',
    }),
    TypeOrmModule.forRoot(typeOrmConfig.options),
    UsersModule,
    CareUnitModule,
    AuthModule,
    RedisModule,
    S3Module,
    ImagesModule,
    DepartmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
