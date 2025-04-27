import { ChatRoomPageClient } from '@/features/user-chat/ui/ChatRoomPageClient';

interface ChatRoomPageProps {
  params: { id: string };
}

export default async function ChatRoomPage({ params }: ChatRoomPageProps) {
  return <ChatRoomPageClient id={params.id} />;
}
