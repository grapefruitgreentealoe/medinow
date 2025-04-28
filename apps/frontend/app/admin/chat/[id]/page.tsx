'use client';
import { AdminChatRoom } from '@/features/admin-chat/ui/AdminChatRoom';
import { useParams } from 'next/navigation';

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  return <AdminChatRoom roomId={roomId} />;
}
