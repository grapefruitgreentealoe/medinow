'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { socket } from '@/lib/socket';
import { ChatMessages } from '@/features/chat/ui/ChatMessages';
import { Message } from '@/features/chat/type';

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  const [messagesMap, setMessagesMap] = useState<
    Map<string, { roomId: string; messages: Message[] }>
  >(new Map());
  const [input, setInput] = useState('');
  const [isRoomReady, setIsRoomReady] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    socket.connect();

    // 1. 방 입장
    socket.emit('joinRoom', { roomId });

    // 2. 이전 메시지 목록 수신
    socket.on('roomMessages', (messages: Message[]) => {
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(roomId, { roomId, messages });
        return newMap;
      });
      setIsRoomReady(true);
    });

    // 3. 새 메시지 수신
    socket.on('newMessage', (message: Message) => {
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(roomId);
        const existingMessages = existing ? existing.messages : [];
        newMap.set(roomId, {
          roomId,
          messages: [...existingMessages, message],
        });
        return newMap;
      });
    });

    return () => {
      socket.disconnect();
      socket.off('roomMessages');
      socket.off('newMessage');
    };
  }, [roomId]);

  const handleSendMessage = () => {
    if (!input.trim() || !roomId) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: 'me',
      content: input,
      createdAt: new Date().toISOString(),
      roomId,
    };

    setMessagesMap((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(roomId);
      const existingMessages = existing ? existing.messages : [];

      newMap.set(roomId, {
        roomId,
        messages: [...existingMessages, tempMessage],
      });
      return newMap;
    });

    socket.emit('sendMessage', { roomId, content: input });
    setInput('');
  };

  if (!isRoomReady) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  const currentMessages = messagesMap.get(roomId)?.messages ?? [];

  return (
    <ChatMessages
      messages={currentMessages}
      input={input}
      setInput={setInput}
      onSendMessage={handleSendMessage}
    />
  );
}
