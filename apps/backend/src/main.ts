import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

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

  // Use Global Pipes
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Create Swagger
  const config = new DocumentBuilder()
    .setTitle('MediNow API')
    .setDescription('MediNow API 문서입니다.')
    .setVersion('0.0.1')
    .addCookieAuth('accessToken')
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
