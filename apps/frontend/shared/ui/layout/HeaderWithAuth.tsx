import { AdminStateProvider } from '@/providers/AdminStateProvider';
import Header from './Header';

export default function HeaderWithAuth() {
  return (
    <AdminStateProvider>
      <Header />
    </AdminStateProvider>
  );
}
