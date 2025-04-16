import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Create App
  const app = await NestFactory.create(AppModule);

  const corsOptions = {
    allowedHeaders: [
      'content-type',
      'authorization',
      'Accept',
      'Authorization',
    ],
    origin: 'http://localhost:3000',
    credentials: true,
  };

  // Use Global Pipes
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Create Swagger
  const config = new DocumentBuilder()
    .setTitle('MediNow API')
    .setDescription('MediNow API 문서입니다.')
    .setVersion('0.0.1')
    // .addBearerAuth() // 헤더에 토큰을 넣어서 요청할 때 사용
    .addCookieAuth('accessToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'accessToken',
    }) // 쿠키에 토큰을 넣어서 요청할 때 사용
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
