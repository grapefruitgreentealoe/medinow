'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { socket } from '@/lib/socket';
import { getChatRooms } from '@/features/chat/api';
import { ChatMessages } from '@/features/chat/ui/ChatMessages';
import { Message } from '@/features/chat/type';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const roomIdFromUrl = searchParams.get('id'); // ✅ roomId
  const careUnitId = searchParams.get('careUnitId'); // ✅ careUnitId

  const [roomId, setRoomId] = useState<string | null>(roomIdFromUrl);
  const [messagesMap, setMessagesMap] = useState<Map<string, Message[]>>(
    new Map()
  );
  const [input, setInput] = useState('');
  const [isRoomReady, setIsRoomReady] = useState(false);

  useEffect(() => {
    if (!roomIdFromUrl && !careUnitId) return;

    socket.connect();

    if (roomIdFromUrl) {
      socket.emit('joinRoom', { roomId: roomIdFromUrl });
      setRoomId(roomIdFromUrl);
    } else if (careUnitId) {
      socket.emit('joinRoom', { careUnitId });
    }

    socket.on('roomCreated', (data: { roomId: string }) => {
      console.log('roomCreated', data.roomId);
      setRoomId(data.roomId); // ✅ 여기서 상태를 갱신해준다
    });

    socket.on(
      'roomMessages',
      (payload: { messages: Message[]; roomId: string }) => {
        const { messages, roomId: receivedRoomId } = payload;
        console.log('roomMessage', payload);
        // ✅ 여기서 시간 기준 정렬 추가
        const sortedMessages = messages.sort((a, b) => {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });

        setMessagesMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(receivedRoomId, sortedMessages);
          return newMap;
        });
        setIsRoomReady(true);
      }
    );

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
      socket.off('roomCreated');
      socket.off('roomMessages');
      socket.off('newMessage');
    };
  }, [roomIdFromUrl, careUnitId]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const messageToSend = input; // ✅ 미리 복사해둔다
    setInput(''); // ✅ 입력창은 바로 비워줘

    if (roomId) {
      // ✅ roomId 있으면 바로 보내기
      socket.emit('sendMessage', { roomId, content: messageToSend });

      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: 'me',
        content: messageToSend,
        createdAt: new Date().toISOString(),
        roomId,
      };

      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        const existingMessages = newMap.get(roomId) || [];
        newMap.set(roomId, [...existingMessages, tempMessage]);
        return newMap;
      });
    } else if (careUnitId) {
      // ✅ roomId 없으면 joinRoom 먼저
      socket.connect();
      socket.emit('joinRoom', { careUnitId });

      socket.once(
        'roomCreated',
        (data: { roomId: string; careUnitId: string }) => {
          const newRoomId = data.roomId;
          setRoomId(newRoomId);

          socket.emit('sendMessage', {
            roomId: newRoomId,
            content: messageToSend,
          });

          const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            senderId: 'me',
            content: messageToSend,
            createdAt: new Date().toISOString(),
            roomId: newRoomId,
          };

          setMessagesMap((prev) => {
            const newMap = new Map(prev);
            const existingMessages = newMap.get(newRoomId) || [];
            newMap.set(newRoomId, [...existingMessages, tempMessage]);
            return newMap;
          });
        }
      );
    }
  };

  if (!roomIdFromUrl && !careUnitId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        채팅방을 선택하거나 병원을 선택하세요
      </div>
    );
  }

  if (!roomId && !careUnitId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        채팅방을 선택하거나 병원을 선택하세요
      </div>
    );
  }

  const currentMessages = messagesMap.get(roomId!) || [];

  return (
    <ChatMessages
      messages={currentMessages}
      input={input}
      setInput={setInput}
      onSendMessage={handleSendMessage}
    />
  );
}
