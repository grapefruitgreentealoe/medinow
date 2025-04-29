'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatRoomList } from '@/features/chat/ui/ChatRoomList';
import { HospitalSimpleCard } from '@/shared/ui/HospitalSimpleCard';
import { RoomInfo } from '@/features/chat/type';
import { getChatRooms } from '@/features/chat/api';
import { getCareUnitById } from '@/shared/api';
import { CareUnit } from '@/shared/type';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [roomList, setRoomList] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<CareUnit | null>(null);
  const searchParams = useSearchParams();

  const id = searchParams.get('id');
  const careUnitId = searchParams.get('careUnitId');
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getChatRooms();
        console.log(res);
        const parsedRooms: RoomInfo[] = res.map((room) => ({
          roomId: room.id,
          careUnitId: room.careUnit.id,
          careUnitName: room.careUnit.name,
          lastMessageAt: room.lastMessageAt,
          unreadCount: room.unreadCount,
          user: room.user,
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

  useEffect(() => {
    const fetchSelectedUnit = async () => {
      try {
        if (careUnitId && !id) {
          // id 없고 careUnitId만 있을 때만 병원 조회
          const careUnit = await getCareUnitById(careUnitId);
          setSelectedUnit(careUnit);
        }
      } catch (error) {
        console.error('병원 정보 조회 실패', error);
        setSelectedUnit(null);
      }
    };

    fetchSelectedUnit();
  }, [id, careUnitId]);

  const onSelectRoom = ({
    roomId,
    selectedUnitId,
  }: {
    roomId: string;
    selectedUnitId: string;
  }) => {
    router.push(`/admin/chat?id=${roomId}`);
  };

  if (loading) return <div>로딩중...</div>;

  return (
    <div className="flex h-[calc(100vh-61px)] !overflow-y-hidden">
      <div className="w-1/3 border-r">
        {roomList.length > 0 ? (
          <ChatRoomList
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

      <div className="w-2/3 flex flex-col">{children}</div>
    </div>
  );
}
