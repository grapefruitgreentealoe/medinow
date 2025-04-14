import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbConfigService } from './config.service';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '/app/.env.production'
          : '.env.local',
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_SYNCHRONIZE: Joi.boolean().required(),
        DATABASE_LOGGING: Joi.boolean().required(),
      }),
    }),
  ],
  providers: [DbConfigService],
  exports: [DbConfigService],
})
export class DbConfigModule {}
