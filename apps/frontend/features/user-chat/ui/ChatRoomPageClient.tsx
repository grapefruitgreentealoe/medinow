'use client';

import { ChatRoom } from './ChatRoom';

interface ChatRoomPageClientProps {
  id: string;
}

export function ChatRoomPageClient({ id }: ChatRoomPageClientProps) {
  return <ChatRoom roomId={id} />;
}
