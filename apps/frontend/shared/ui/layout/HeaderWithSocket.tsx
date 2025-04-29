'use client';

import { SocketProvider } from '@/shared/provider/SocketContext';
import Header from './Header';

export default function HeaderWithSocket() {
  return (
    <SocketProvider>
      <Header />
    </SocketProvider>
  );
}
