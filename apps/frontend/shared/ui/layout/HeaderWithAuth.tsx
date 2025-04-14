// 'use client';

import Header from './Header';
import AuthInitProvider from '@/providers/AuthInitProvider';

export default function HeaderWithAuth() {
  return (
    <AuthInitProvider>
      <Header />
    </AuthInitProvider>
  );
}
