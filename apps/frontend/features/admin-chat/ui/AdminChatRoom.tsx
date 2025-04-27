'use client';

import { useEffect } from 'react';
import { socket } from '@/lib/socket';

export function AdminChatRoom({ roomId }: { roomId: string }) {
  useEffect(() => {
    socket.connect();
    socket.emit('joinRoom', { roomId }); // 어드민은 roomId로 입장만 함

    return () => {
      socket.emit('leaveRoom', { roomId });
    };
  }, [roomId]);

  return (
    <div className="p-4">
      <div>Admin 채팅방 (roomId: {roomId})</div>
      {/* 이후 메시지 목록 + 입력창 추가 */}
    </div>
  );
}
