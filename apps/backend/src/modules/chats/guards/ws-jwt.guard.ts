import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UsersService } from '../../users/users.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token = this.extractToken(client);

    if (!token) {
      throw new WsException('인증 토큰이 없습니다');
    }

    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findUserById(payload.sub);

      if (!user) {
        throw new WsException('사용자를 찾을 수 없습니다');
      }

      // 소켓에 사용자 정보 저장
      client.data.user = user;
      return true;
    } catch (error) {
      throw new WsException('인증 토큰이 유효하지 않습니다');
    }
  }

  private extractToken(client: Socket): string | undefined {
    // 1. 헤더에서 토큰 찾기
    const auth = client.handshake.headers.authorization;
    if (auth) {
      const [type, token] = auth.split(' ');
      if (type === 'Bearer' && token) {
        return token;
      }
    }

    // 2. 쿠키에서 토큰 찾기
    const cookies = client.handshake.headers.cookie;
    if (cookies) {
      const cookieMap = {};
      cookies.split(';').forEach((cookie) => {
        const [key, value] = cookie.trim().split('=');
        cookieMap[key] = value;
      });

      if (cookieMap['accessToken']) {
        return cookieMap['accessToken'];
      }
    }

    // 3. 핸드셰이크 쿼리에서 토큰 찾기
    if (client.handshake.query && client.handshake.query.token) {
      return client.handshake.query.token as string;
    }

    return undefined;
  }
}
