'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatRoomList } from '@/features/chat/ui/ChatRoomList';
import { HospitalSimpleCard } from '@/shared/ui/HospitalSimpleCard';
import { RoomInfo } from '@/features/chat/type';
import { getChatRooms } from '@/features/chat/api';
import { getCareUnitById } from '@/shared/api';
import { CareUnit } from '@/shared/type';
import { cn } from '@/lib/utils';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [roomList, setRoomList] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(id);
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getChatRooms();
        setSelectedRoomId(id);
        setRoomList(res);
      } catch (error) {
        console.error('방 목록 불러오기 실패', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const onSelectRoom = ({
    roomId,
    selectedUnitId,
    userId,
  }: {
    roomId: string;
    selectedUnitId: string;
    userId: string;
  }) => {
    router.push(`/admin/chat?id=${roomId}`);
    setSelectedRoomId(userId);
  };

  if (loading) return <div>로딩중...</div>;

  return (
    <div
      className="flex !overflow-y-hidden"
      style={{ height: 'calc(var(--vh, 1vh) * 100 - 61px)' }}
    >
      <div
        className={cn(
          'w-1/3 border-r',
          id ? 'max-[1624px]:hidden' : 'max-[1624px]:w-full'
        )}
      >
        {roomList.length > 0 ? (
          <ChatRoomList
            selectedRoomId={selectedRoomId!}
            isAdmin={true}
            rooms={roomList}
            onSelectRoom={onSelectRoom}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            채팅방이 없습니다
          </div>
        )}
      </div>

      <div
        className={cn(
          'w-2/3 flex flex-col',
          id ? 'max-[1624px]:w-full' : 'max-[1624px]:hidden'
        )}
      >
        {id ? (
          <div className="h-full !p-[20px]" key={id}>
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
