'use client';

import { RoomInfo } from '@/features/chat/type';
import { cn } from '@/lib/utils';
import { CareUnit } from '@/shared/type';

interface ChatRoomListProps {
  selectedRoomId: string;
  rooms: RoomInfo[];
  onSelectRoom: (payload: {
    roomId: string;
    selectedUnitId: string;
    userId: string;
  }) => void;
  isAdmin?: boolean;
}

export function ChatRoomList({
  selectedRoomId,
  rooms,
  onSelectRoom,
  isAdmin = false,
}: ChatRoomListProps) {
  return (
    <div className="p-4 space-y-2">
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() =>
            onSelectRoom({
              roomId: room.id!,
              selectedUnitId: room.careUnit.id!,
              userId: room.user.id,
            })
          }
          className={cn(
            'w-full p-3 bg-muted rounded text-left hover:bg-accent',
            selectedRoomId === room.id ? 'bg-accent' : 'bg-muted'
          )}
        >
          <div className="font-semibold">
            {isAdmin ? room.user.nickName : room.careUnit.name}
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
