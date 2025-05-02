import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/logger/winston.config';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  // Create App
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  const corsOptions = {
    origin: [
      'http://localhost:3000',
      'https://localhost:3001',
      'http://localhost:3001',
      'https://medinow.co.kr',
      'https://www.medinow.co.kr',
    ],
    credentials: true,
    allowedHeaders: ['content-type', 'Authorization', 'cookies', 'set-cookie'],
  };

  // Use Cookie Parser
  app.use(cookieParser());

  // Helmet 보안 설정 적용

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"], // 기본 소스 제한
          scriptSrc: ["'self'"], // 스크립트 소스 제한
          styleSrc: ["'self'", 'https:', "'unsafe-inline'"], // 스타일 소스 제한
          imgSrc: ["'self'", 'data:', 'https:'], // 이미지 소스 제한
          connectSrc: ["'self'", 'https:'], // 연결 소스 제한
          fontSrc: ["'self'", 'https:'], // 폰트 소스 제한
          objectSrc: ["'none'"], // 객체 소스 제한
          mediaSrc: ["'self'"], // 미디어 소스 제한
          frameSrc: ["'self'"], // 프레임 소스 제한
        },
      },
      noSniff: true, // MIME 스니핑 방지
      frameguard: { action: 'sameorigin' }, // 프레임 보호
      hsts: {
        maxAge: 31536000, // 1년
        includeSubDomains: true, // 서브 도메인 포함
        preload: true, // 사전 로드 활성화
      },
      dnsPrefetchControl: { allow: false }, // DNS 프리페치 제어
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, // 참조 정책
      crossOriginResourcePolicy: { policy: 'same-origin' }, // 교차 출처 리소스 정책
    }),
  );

  // Use Global Pipes
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Create Swagger
  const config = new DocumentBuilder()
    .setTitle('MediNow API')
    .setDescription('MediNow API 문서입니다.')
    .setVersion('0.0.1')
    .addServer('api/v1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // Set Global Prefix
  app.setGlobalPrefix('api/v1', {
    exclude: ['swagger'],
  });

  // Use Cors
  app.enableCors(corsOptions);

  app.useWebSocketAdapter(new IoAdapter(app));

  // Start Server
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
