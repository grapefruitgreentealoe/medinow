import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
  transports: ['websocket'],
  withCredentials: true, // 필요하면 추가
  autoConnect: false, // << 연결 자동 X
});
