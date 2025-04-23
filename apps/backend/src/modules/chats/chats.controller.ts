import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { RequestUser } from '../../common/decorators/request-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('채팅')
@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('rooms')
  @ApiOperation({ summary: '채팅방 생성/활성화' })
  @ApiCreatedResponse({
    description: '채팅방 생성/활성화 성공',
  })
  async createRoom(
    @RequestUser() user: User,
    @Body() data: { careUnitId: string },
  ) {
    const room = await this.chatsService.createRoom(user.id, data.careUnitId);
    return { roomId: room.id };
  }

  @Get('rooms')
  @ApiOperation({ summary: '사용자의 채팅방 목록 조회' })
  @ApiOkResponse({
    description: '채팅방 목록 조회 성공',
  })
  async getUserRooms(@RequestUser() user: User) {
    return this.chatsService.getUserRooms(user.id);
  }

  @Get('rooms/:roomId/messages')
  @ApiOperation({ summary: '채팅방 메시지 목록 조회' })
  @ApiOkResponse({
    description: '메시지 목록 조회 성공',
  })
  async getRoomMessages(
    @RequestUser() user: User,
    @Param('roomId') roomId: string,
  ) {
    // 접근 권한 확인
    const hasAccess = await this.chatsService.checkRoomAccess(user.id, roomId);
    if (!hasAccess) {
      throw new UnauthorizedException('해당 채팅방에 접근할 권한이 없습니다');
    }

    return this.chatsService.getRoomMessages(roomId, user.id);
  }

  @Get('unread')
  @ApiOperation({ summary: '읽지 않은 메시지 수 조회' })
  @ApiOkResponse({
    description: '읽지 않은 메시지 수 조회 성공',
  })
  async getUnreadMessageCount(@RequestUser() user: User) {
    return this.chatsService.getUnreadMessageCount(user.id);
  }
}
