import { ChatRoom } from '@/features/chat/ui/ChatRoom';

interface ChatRoomPageProps {
  params: {
    id: string;
    roomId: string;
  };
}

export default async function ChatRoomPage({ params }: ChatRoomPageProps) {
  return <ChatRoom careUnitId={params.id} roomId={params.roomId} />;
}
