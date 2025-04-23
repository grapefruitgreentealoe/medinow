import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsGateway } from './chats.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatRoom } from './entities/chat-room.entity';
import { UsersModule } from '../users/users.module';
import { CustomLoggerService } from '../../shared/logger/logger.service';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from '../../config/app/config.module';
import { AppConfigService } from '../../config/app/config.service';
import { ChatsController } from './chats.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, ChatRoom]),
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: (appConfigService: AppConfigService) => ({
        secret: appConfigService.jwtAccessSecret,
        signOptions: {
          expiresIn: appConfigService.jwtAccessExpirationTime,
        },
      }),
      inject: [AppConfigService],
    }),
    UsersModule,
    RedisModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsGateway, ChatsService, CustomLoggerService, JwtAuthGuard],
  exports: [ChatsService, ChatsGateway],
})
export class ChatsModule {}
