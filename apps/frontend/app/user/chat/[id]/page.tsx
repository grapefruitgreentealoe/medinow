import { ChatRoom } from '@/features/chat/ui/ChatRoom';

interface ChatRoomPageProps {
  params: { id: string };
}

export default function ChatRoomPage({ params }: ChatRoomPageProps) {
  const { id } = params;

  return <ChatRoom roomId={id} />;
}
