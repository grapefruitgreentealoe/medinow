'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatRoomList } from '@/features/chat/ui/ChatRoomList';
import { HospitalSimpleCard } from '@/shared/ui/HospitalSimpleCard';
import { RoomInfo } from '@/features/chat/type';
import { getChatRooms } from '@/features/chat/api';
import { getCareUnitById } from '@/shared/api';
import { CareUnit } from '@/shared/type';
import {
  ArrowBigLeftDashIcon,
  ArrowBigLeftIcon,
  ChevronLeft,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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

  const [openSheet, setOpenSheet] = useState(false);

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
    router.push(`/user/chat?id=${roomId}`);
  };

  if (loading) return <div>로딩중...</div>;

  return (
    <div className="relative flex h-[calc(100vh-61px)] !overflow-y-hidden">
      {/* 왼쪽 - 채팅방 목록 */}
      <div className={cn('w-1/4 border-r', 'max-[1624px]:w-1/3')}>
        {roomList.length > 0 ? (
          <ChatRoomList rooms={roomList} onSelectRoom={onSelectRoom} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            채팅방이 없습니다
          </div>
        )}
      </div>

      {/* 가운데 - 채팅 메시지 */}
      <div className={cn('w-2/4 border-r', 'max-[1624px]:w-2/3')}>
        {children}
      </div>

      {/* 오른쪽 - 병원 정보 */}

      <div className="w-1/4 border-l max-[1624px]:hidden">
        {selectedUnit ? (
          <HospitalSimpleCard unit={selectedUnit} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground ">
            병원을 선택하세요
          </div>
        )}
      </div>

      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        {/* 오른쪽 위 버튼 */}
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="absolute top-4 right-4 z-50 border rounded-full p-2 shadow-md opacity-70 hover:opacity-100  min-[1624px]:hidden"
            onClick={() => setOpenSheet(true)}
          >
            <ArrowBigLeftDashIcon /> 기관 정보 보기
          </Button>
        </SheetTrigger>

        {/* 열리는 컨텐츠 */}
        <SheetContent side="right" className="w-3/4 p-0">
          <SheetHeader className="p-4">
            <SheetTitle>병원 정보</SheetTitle>
          </SheetHeader>

          <div className="h-[calc(100%-64px)] overflow-y-auto p-4">
            {selectedUnit ? (
              <HospitalSimpleCard unit={selectedUnit} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                병원을 선택하세요
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
