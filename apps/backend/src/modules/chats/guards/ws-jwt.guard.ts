import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  getRequest(context: ExecutionContext) {
    const client = context.switchToWs().getClient<Socket>();
    const cookies = client.handshake.headers.cookie;
    let token: string | null = null;

    if (cookies) {
      const cookieArray = cookies.split(';');
      for (const cookie of cookieArray) {
        const [key, value] = cookie.trim().split('=');
        if (key === 'accessToken') {
          token = value;
          break;
        }
      }
    }

    if (!token) {
      throw new Error('인증 토큰이 없습니다');
    }

    return {
      cookies: { accessToken: token },
    };
  }
}
