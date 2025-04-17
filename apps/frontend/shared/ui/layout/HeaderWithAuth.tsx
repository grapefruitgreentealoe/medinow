import { AuthStateProvider } from '@/providers/AuthStateProvider';
import Header from './Header';

export default function HeaderWithAuth() {
  return (
    <AuthStateProvider>
      <Header />
    </AuthStateProvider>
  );
}
