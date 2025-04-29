// contexts/SocketContext.tsx
'use client';

import { createContext, useContext, useEffect } from 'react';
import { socket } from '@/lib/socket';

const SocketContext = createContext(socket);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
