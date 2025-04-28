'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { socket } from '@/lib/socket';
import { ChatRoomList } from '@/features/chat/ui/ChatRoomList';
import { HospitalInfoCard } from '@/features/chat/ui/HospitalInfoCard';
import { ChatMessages } from '@/features/chat/ui/ChatMessages';
import { RoomInfo, Message } from '@/features/chat/type';
import axiosInstance from '@/lib/axios';
import { ChatRoom, getChatRooms } from '@/features/chat/api';

interface ChatLayoutProps {
  children?: React.ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const [roomList, setRoomList] = useState<RoomInfo[]>([]);
  const router = useRouter();

  useEffect(() => {
    // 처음 방 리스트 가져오기
    const fetchRooms = async () => {
      try {
        const res = await getChatRooms();
        const parsedRooms: RoomInfo[] = res.map((room: ChatRoom) => ({
          roomId: room.id,
          careUnitId: room.careUnit.id,
          careUnitName: room.careUnit.name,
          lastMessageAt: room.lastMessageAt,
          unreadCount: room.unreadCount,
        }));

        //방 목록
        setRoomList(parsedRooms);
      } catch (error) {
        console.error('방 목록 불러오기 실패', error);
      }
    };

    fetchRooms();
  }, []);
  //룸아이디를 선택 시, 룸 아이디로 접근
  const handleSelectRoom = (roomId: string) => {
    router.push(`/user/chat/${roomId}`);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r overflow-y-auto">
        <ChatRoomList rooms={roomList} onSelectRoom={handleSelectRoom} />
      </div>
      <div className="w-2/4 flex flex-col">{children}</div>
      <div className="w-1/4 border-l overflow-y-auto">
        <HospitalInfoCard />
      </div>
    </div>
  );
}
