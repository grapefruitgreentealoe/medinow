import { AdminChatRoom } from '@/features/admin-chat/ui/AdminChatRoom';

interface ChatRoomPageProps {
  params: { id: string };
}

export default function ChatRoomPage({ params }: ChatRoomPageProps) {
  const { id } = params;

  return <AdminChatRoom roomId={id} />;
}
