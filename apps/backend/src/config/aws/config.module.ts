import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import * as Joi from 'joi';
import { AwsConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_BUCKET_NAME: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
      }),
    }),
  ],
  providers: [ConfigService, AwsConfigService],
  exports: [ConfigService, AwsConfigService],
})
export class AwsConfigModule {}
