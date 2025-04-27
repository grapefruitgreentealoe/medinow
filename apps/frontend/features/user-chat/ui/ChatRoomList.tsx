'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ChatRoomList() {
  const rooms = [
    {
      id: '1',
      name: 'City General Hospital',
      unreadCount: 0,
      lastMessage: 'Yes, our ER is available.',
    },
    {
      id: '2',
      name: 'Riverside Medical',
      unreadCount: 2,
      lastMessage: 'Availability in cardiology.',
    },
    {
      id: '3',
      name: 'Memorial Hospital',
      unreadCount: 0,
      lastMessage: 'Please bring insurance card.',
    },
  ];

  return (
    <div className="flex flex-col p-2">
      {rooms.map((room) => (
        <Button
          key={room.id}
          variant="ghost"
          className="flex justify-between items-center h-16 text-left"
        >
          <div className="flex flex-col">
            <span className="font-medium">{room.name}</span>
            <span className="text-xs text-gray-500 truncate w-40">
              {room.lastMessage}
            </span>
          </div>
          {room.unreadCount > 0 && (
            <Badge variant="secondary">{room.unreadCount}</Badge>
          )}
        </Button>
      ))}
    </div>
  );
}
