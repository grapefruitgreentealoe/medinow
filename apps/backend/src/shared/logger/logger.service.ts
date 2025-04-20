import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, Logger } from 'winston';
import { winstonConfig } from '../../config/logger/winston.config';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger(winstonConfig);
  }

  setContext(context: string) {
    this.logger.defaultMeta = {
      ...this.logger.defaultMeta,
      context,
    };
  }

  log(message: string, context?: string, ...meta: any[]) {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, ...meta: any[]) {
    this.logger.error(message, { trace, context, ...meta });
  }

  warn(message: string, context?: string, ...meta: any[]) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, ...meta: any[]) {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, ...meta: any[]) {
    this.logger.verbose(message, { context, ...meta });
  }
}
