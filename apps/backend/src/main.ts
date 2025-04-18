import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  // Create App
  const app = await NestFactory.create(AppModule);

  const corsOptions = {
    origin: [
      'http://localhost:3000',
      'https://kdt-node-2-team02.elicecoding.com',
    ],
    credentials: true,
    allowedHeaders: ['content-type', 'Authorization'],
  };

  // Use Cookie Parser
  app.use(cookieParser());

  // Helmet 보안 설정 적용
  // 테스트 환경인 경우 일부 옵션 비활성화
  const isTestEnv = process.env.NODE_ENV === 'development';

  app.use(
    helmet({
      // 기본 보안 헤더 설정
      contentSecurityPolicy: isTestEnv
        ? false
        : {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
              styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
              imgSrc: ["'self'", 'data:', 'https:'],
              connectSrc: ["'self'", 'https:'],
              fontSrc: ["'self'", 'https:'],
              objectSrc: ["'none'"],
              mediaSrc: ["'self'"],
              frameSrc: ["'self'"],
            },
          },
      // Cross-Site-Scripting 공격 방지
      xssFilter: true,
      // MIME 스니핑 방지
      noSniff: true,
      // iframe 내 표시 제한
      frameguard: {
        action: 'sameorigin',
      },
      // HSTS 설정 (테스트 환경에서는 비활성화)
      hsts: isTestEnv
        ? false
        : {
            maxAge: 31536000, // 1년
            includeSubDomains: true,
            preload: true,
          },
      // 클릭재킹 방지
      // referrerPolicy: { policy: 'same-origin' },
      // DNS prefetch 제어 (테스트 환경에서는 비활성화)
      dnsPrefetchControl: isTestEnv ? false : { allow: false },
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

  // Start Server
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
