import { ChatLayout } from '@/features/user-chat/ui/ChatLayout';
import { ChatRoomList } from '@/features/user-chat/ui/ChatRoomList';
import { ChatMessages } from '@/features/user-chat/ui/ChatMessages';
import { HospitalInfoCard } from '@/features/user-chat/ui/HospitalInfoCard';

export default function ChatPage() {
  return (
    <ChatLayout
      left={<ChatRoomList />}
      center={<ChatMessages />}
      right={<HospitalInfoCard />}
    />
  );
}
