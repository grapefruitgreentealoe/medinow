import { Global, Module } from '@nestjs/common';
import { CustomLoggerService } from './logger.service';

@Global() // 글로벌 모듈로 설정하여 모든 모듈에서 사용 가능
@Module({
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class LoggerModule {}
