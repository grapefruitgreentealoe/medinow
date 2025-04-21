import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import * as Joi from 'joi';
import { AppConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRATION_TIME: Joi.number().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRATION_TIME: Joi.number().required(),
        PORT: Joi.number().required(),
        NODE_ENV: Joi.string().required(),
        SERVICE_KEY: Joi.string().required(),
        EMERGENCY_API_URL: Joi.string().required(),
        HOSPITAL_API_URL: Joi.string().required(),
        PHARMACY_API_URL: Joi.string().required(),
        HOSPITAL_BASIC_API_URL: Joi.string().required(),
        EMERGENCY_CONGESTION_API_URL: Joi.string().required(),
      }),
    }),
  ],
  providers: [ConfigService, AppConfigService],
  exports: [ConfigService, AppConfigService],
})
export class AppConfigModule {}
