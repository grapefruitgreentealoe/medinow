'use client';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  isAdmin: boolean;
  timestamp: string;
  isRead: boolean;
}
import { Card, CardContent } from '@/components/ui/card';

export function MessageItem({ message }: { message: Message }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1">
        <div className="text-sm font-semibold">{message.senderName}</div>
        <div className="text-gray-700">{message.content}</div>
        <div className="text-xs text-gray-400">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}
