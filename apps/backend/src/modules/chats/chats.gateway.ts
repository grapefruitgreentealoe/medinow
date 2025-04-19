import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { CustomLoggerService } from '../../shared/logger/logger.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'chats',
  cors: {
    origin: '*',
  },
})
export class ChatsGateway {
  @WebSocketServer() server: Server;

  constructor(
    private readonly chatsService: ChatsService,
    private readonly logger: CustomLoggerService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log('Client connected');
  }

  // handleDisconnect(client: Socket) {
  //   this.logger.log('Client disconnected');
  //   this.chatsService.handleDisconnect(client.id);
  // }

  // @UseGuards(JwtAuthGuard)
  // @SubscribeMessage('joinRoom')
  // async handleJoinRoom(client: Socket, payload: { roomId: string }) {
  //   const { roomId } = payload;
  //   const userId = client.data.user.id;

  //   await this.chatsService.joinRoom(userId, roomId);
  //   this.server.to(roomId).emit('userJoined', userId);
  // }
}
