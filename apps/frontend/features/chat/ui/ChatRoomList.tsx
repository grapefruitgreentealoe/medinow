'use client';

import { RoomInfo } from '@/features/chat/type';
import { cn } from '@/lib/utils';
import { CareUnit } from '@/shared/type';

interface ChatRoomListProps {
  selectedUnitId: string;
  rooms: RoomInfo[];
  onSelectRoom: (payload: { roomId: string; selectedUnitId: string }) => void;
  isAdmin?: boolean;
}

export function ChatRoomList({
  selectedUnitId,
  rooms,
  onSelectRoom,
  isAdmin = false,
}: ChatRoomListProps) {
  return (
    <div className="p-4 space-y-2">
      {rooms.map((room) => (
        <button
          key={room.roomId}
          onClick={() =>
            onSelectRoom({
              roomId: room.roomId!,
              selectedUnitId: room.careUnitId!,
            })
          }
          className={cn(
            'w-full p-3 bg-muted rounded text-left hover:bg-accent',
            selectedUnitId === room.careUnitId ? 'bg-accent' : 'bg-muted'
          )}
        >
          <div className="font-semibold">
            {isAdmin ? room.user.nickName : room.careUnitName}
          </div>
          <div className="text-xs text-gray-500">
            {room.lastMessageAt
              ? new Date(room.lastMessageAt).toLocaleString()
              : '대화 시작 전'}
          </div>
        </button>
      ))}
    </div>
  );
}
