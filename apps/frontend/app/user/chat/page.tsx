'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { socket } from '@/lib/socket';
import { ChatMessages } from '@/features/chat/ui/ChatMessages';
import { Message } from '@/features/chat/type';
import { Button } from '@/components/ui/button';
import { ArrowBigLeftDashIcon, ArrowLeftFromLineIcon } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const roomIdFromUrl = searchParams.get('id');
  const careUnitId = searchParams.get('careUnitId');
  const router = useRouter();

  const [messagesMap, setMessagesMap] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isRoomReady, setIsRoomReady] = useState(false);

  const roomIdRef = useRef<string | null>(null);
  const hasConnectedRef = useRef(false);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!socket.connected && !hasConnectedRef.current) {
      socket.connect();
      hasConnectedRef.current = true;
    }

    socket.on('roomCreated', handleRoomResolved);
    socket.on('roomMessages', handleRoomMessages);
    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('roomCreated', handleRoomResolved);
      socket.off('roomMessages', handleRoomMessages);
      socket.off('newMessage', handleNewMessage);
    };
  }, []);

  useEffect(() => {
    if (!roomIdFromUrl && !careUnitId) return;
    if (hasJoinedRef.current) return;

    hasJoinedRef.current = true;

    if (roomIdFromUrl) {
      console.log('roomIdFromUrl로 입장');
      socket.emit('joinRoom', { roomId: roomIdFromUrl });
      roomIdRef.current = roomIdFromUrl;
      setIsRoomReady(true);
    } else if (careUnitId) {
      console.log('careUnitId로 joinRoom 요청');
      socket.emit('joinRoom', { careUnitId });
    }
  }, [roomIdFromUrl, careUnitId]);

  const handleRoomResolved = (data: { roomId: string }) => {
    console.log('resolvedRoom', data.roomId);
    roomIdRef.current = data.roomId;
    setIsRoomReady(true);
  };

  const handleRoomMessages = (payload: {
    messages: Message[];
    roomId: string;
  }) => {
    console.log('roomMessages', payload);

    const { messages } = payload;
    const sortedMessages = [...messages].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    console.log('roomMEssage', payload);
    // roomIdRef.current = receivedRoomId;
    setMessagesMap(sortedMessages);
  };

  const handleNewMessage = (message: Message) => {
    const currentRoomId = roomIdRef.current;
    if (!currentRoomId) return;
    setMessagesMap((o) => [...o, message]);
  };

  const handleSendMessage = () => {
    if (!roomIdRef.current || !isRoomReady) {
      console.warn('❌ 방 준비 안 됨');
      return;
    }

    socket.emit('sendMessage', {
      roomId: roomIdRef.current,
      content: input,
    });
    setInput('');
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
        채팅방을 선택하거나, 병원 목록으로부터 채팅을 시작하세요
      </div>
    );
  }

  return (
    <div className="!pt-[40px] h-full">
      <Button
        variant="destructive"
        className="absolute top-4 z-50 border p-2 shadow-md opacity-70 hover:opacity-100"
        onClick={() => {
          router.push(ROUTES.USER.CHAT(''));
        }}
      >
        <ArrowLeftFromLineIcon />
        나가기
      </Button>

      <ChatMessages
        messages={messagesMap}
        input={input}
        setInput={setInput}
        onSendMessage={handleSendMessage}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
      />
    </div>
  );
}
