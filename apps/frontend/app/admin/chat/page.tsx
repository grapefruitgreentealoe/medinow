import { AdminChatRoom } from '@/features/admin-chat/ui/AdminChatRoom';

interface AdminChatRoomPageProps {
  params: { id: string };
}

export default async function AdminChatRoomPage({
  params,
}: AdminChatRoomPageProps) {
  return <AdminChatRoom roomId={params.id} />;
}
