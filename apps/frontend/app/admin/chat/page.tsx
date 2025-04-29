'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { socket } from '@/lib/socket';
import { ChatMessages } from '@/features/chat/ui/ChatMessages';
import { Message, RoomMessagesFromServer } from '@/features/chat/type';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const roomIdFromUrl = searchParams.get('id'); // roomId
  const careUnitId = searchParams.get('careUnitId'); // careUnitId

  const [roomId, setRoomId] = useState<string | null>(roomIdFromUrl);
  const [messagesMap, setMessagesMap] = useState<Message[]>([]);

  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false); // 한글 조합 중 여부
  const [isRoomReady, setIsRoomReady] = useState(false); // 방 준비 여부

  useEffect(() => {
    if (!roomIdFromUrl && !careUnitId) return;
    socket.connect();

    if (roomIdFromUrl) {
      socket.emit('joinRoom', { roomId: roomIdFromUrl });
      setRoomId(roomIdFromUrl);
    } else if (careUnitId) {
      socket.emit('joinRoom', { careUnitId });
    }

    socket.on(
      'roomMessages',
      (payload: { messages: Message[]; roomId: string }) => {
        const { messages } = payload;
        console.log('admin roomMessages', messages);
        const sortedMessages = [...messages].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        setMessagesMap(sortedMessages);

        setIsRoomReady(true);
      }
    );

    socket.on('newMessage', (message: Message) => {
      console.log('newMessage', message);

      setMessagesMap((o) => [...o, message]);
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
    if (!roomId) {
      console.warn('아직 방이 만들어지지 않았습니다.');
      return;
    }
    if (!isRoomReady) {
      console.warn('방이 아직 준비되지 않았습니다.');
      return;
    }

    const messageToSend = input;
    setInput(''); // 입력창 비우기

    socket.emit('sendMessage', { roomId, content: messageToSend });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!roomIdFromUrl && !careUnitId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        채팅방을 선택하거나 병원을 선택하세요
      </div>
    );
  }

  return (
    <ChatMessages
      isAdmin={true}
      messages={messagesMap}
      input={input}
      setInput={setInput}
      onSendMessage={handleSendMessage}
      onKeyDown={handleKeyDown}
      onCompositionStart={() => setIsComposing(true)}
      onCompositionEnd={() => setIsComposing(false)}
    />
  );
}
