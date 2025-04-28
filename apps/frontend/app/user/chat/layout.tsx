'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/lib/socket';
import { ChatRoomList } from '@/features/chat/ui/ChatRoomList';
import { HospitalInfoCard } from '@/features/chat/ui/HospitalInfoCard';
import { RoomInfo } from '@/features/chat/type';
import { getChatRooms } from '@/features/chat/api';
import { SearchCareUnitForReview } from '@/features/user-review/ui/SearchCareUnitForReview'; // 추가
import { SearchCareUnitForChat } from '@/features/chat/ui/SearchCareUnitForChat';

export default function ChatLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [roomList, setRoomList] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getChatRooms();
        const parsedRooms: RoomInfo[] = res.map((room) => ({
          roomId: room.id,
          careUnitId: room.careUnit.id,
          careUnitName: room.careUnit.name,
          lastMessageAt: room.lastMessageAt,
          unreadCount: room.unreadCount,
        }));

        setRoomList(parsedRooms);
      } catch (error) {
        console.error('방 목록 불러오기 실패', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleSelectRoom = (roomId: string) => {
    router.push(`/user/chat/${roomId}`);
  };

  if (loading) return <div>로딩중...</div>;

  return (
    <div className="flex h-[calc(100vh-61px)] !overflow-y-hidden">
      <div className="w-1/4 border-r">
        {roomList.length > 0 ? (
          <ChatRoomList rooms={roomList} onSelectRoom={handleSelectRoom} />
        ) : (
          <SearchCareUnitForChat />
        )}
      </div>

      <div className="w-2/4 flex flex-col">{children}</div>

      <div className="w-1/4 border-l">
        <HospitalInfoCard />
      </div>
    </div>
  );
}
