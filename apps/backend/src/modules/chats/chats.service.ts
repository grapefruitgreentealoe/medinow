import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { CustomLoggerService } from '../../shared/logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChatsService {
  // private readonly connectedClients = new Map<string, Socket>();
  // constructor(
  //   @InjectRepository(ChatRoom)
  //   private readonly chatRoomRepository: Repository<ChatRoom>,
  //   private readonly logger: CustomLoggerService,
  //   private readonly userService: UsersService,
  // ) {}
  // handleDisconnect(clientId: string) {
  //   this.logger.log(`Client ${clientId} disconnected`);
  //   this.connectedClients.delete(clientId);
  // }
}
