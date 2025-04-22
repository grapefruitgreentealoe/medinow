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
    // 쿠키에서 토큰 추출
    let token: string | string[] | null = null;
    const cookies = client.handshake.headers.cookie;

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

    // 쿠키에 토큰이 없으면 auth 객체 확인
    if (!token && client.handshake.auth?.token) {
      token = client.handshake.auth.token;
    }

    // 토큰 없으면 query 파라미터 확인
    if (!token && client.handshake.query?.token) {
      token = client.handshake.query.token;
      if (Array.isArray(token)) {
        token = token[0];
      }
    }

    return {
      headers: { authorization: token ? `Bearer ${String(token)}` : '' },
    };
  }
}
