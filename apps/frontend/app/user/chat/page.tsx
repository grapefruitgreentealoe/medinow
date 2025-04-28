'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { socket } from '@/lib/socket';
import { ChatMessages } from '@/features/chat/ui/ChatMessages';
import { Message } from '@/features/chat/type';
import { getChatRooms } from '@/features/chat/api';
import { ROUTES } from '@/shared/constants/routes';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const careUnitId = searchParams.get('id');
  console.log(careUnitId);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [messagesMap, setMessagesMap] = useState<Map<string, Message[]>>(
    new Map()
  );
  const router = useRouter();

  const [input, setInput] = useState('');

  useEffect(() => {
    socket.connect();

    const fetchAndJoinRoom = async () => {
      const rooms = await getChatRooms();

      const matchedRoom = rooms.find((room) => room.careUnit.id === careUnitId);

      if (matchedRoom) {
        router.push(ROUTES.USER.CHAT(matchedRoom.id as string));
      } else {
        console.log('notmatched');

        socket.emit('joinRoom', { careUnitId });

        socket.once(
          'roomCreated',
          (data: { roomId: string; careUnitId: string }) => {
            console.log('hihi');
            setCurrentRoomId(data.roomId);
            router.push(ROUTES.USER.CHAT(data.roomId as string));
          }
        );
      }
    };

    fetchAndJoinRoom();
    if (!careUnitId) return;

    socket.on('roomMessages', (messages: Message[]) => {
      if (!messages.length) return;
      const roomId = messages[0].roomId;
      setMessagesMap((prev) => new Map(prev).set(roomId, messages));
    });

    socket.on('newMessage', (message: Message) => {
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        const existingMessages = newMap.get(message.roomId) || [];
        newMap.set(message.roomId, [...existingMessages, message]);
        return newMap;
      });
    });

    return () => {
      socket.disconnect();
      socket.off('roomMessages');
      socket.off('newMessage');
      socket.off('roomCreated');
    };
  }, [careUnitId]);

  const handleSendMessage = () => {
    if (!input.trim() || !currentRoomId) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: 'me',
      content: input,
      createdAt: new Date().toISOString(),
      roomId: currentRoomId,
    };

    setMessagesMap((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(currentRoomId) || [];
      newMap.set(currentRoomId, [...existing, tempMessage]);
      return newMap;
    });

    socket.emit('sendMessage', { roomId: currentRoomId, content: input });
    setInput('');
  };

  if (!careUnitId) return <div>잘못된 접근입니다!</div>;

  return (
    <ChatMessages
      messages={messagesMap.get(currentRoomId!) || []}
      input={input}
      setInput={setInput}
      onSendMessage={handleSendMessage}
    />
  );
}
