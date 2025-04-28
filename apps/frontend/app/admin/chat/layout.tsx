'use client';

import { useEffect } from 'react';
import { socket } from '@/lib/socket';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    socket.connect(); // 직접 연결

    socket.on('connect', () => {
      console.log('✅ Socket connected!', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    return () => {
      socket.disconnect();
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return <div className="flex h-screen">{children}</div>;
}
