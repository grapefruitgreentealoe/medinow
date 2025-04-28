'use client';

import { RoomInfo } from '@/features/chat/type';

interface ChatRoomListProps {
  rooms: RoomInfo[];
  onSelectRoom: (careUnitId: string) => void;
}

export function ChatRoomList({ rooms, onSelectRoom }: ChatRoomListProps) {
  return (
    <div className="p-4 space-y-2">
      {rooms.map((room) => (
        <button
          key={room.roomId}
          onClick={() => onSelectRoom(room.roomId)}
          className="w-full p-3 bg-muted rounded text-left hover:bg-accent"
        >
          <div className="font-semibold">{room.careUnitName}</div>
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
