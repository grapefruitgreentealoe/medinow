'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { socket } from '@/lib/socket';
import { ChatMessages } from '@/features/chat/ui/ChatMessages';
import { Message } from '@/features/chat/type';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';

export default function AdminChatPage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('id');
  const roomIdRef = useRef(roomId); // 안정성 확보
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  // 1. connect 이벤트 후 방 입장
  const handleConnect = useCallback(() => {
    if (roomIdRef.current) {
      socket.emit('joinRoom', { roomId: roomIdRef.current });
    }
  }, []);

  // 2. 방 전체 메시지 수신
  const handleRoomMessages = useCallback(
    (payload: { messages: Message[]; roomId: string }) => {
      if (payload.roomId !== roomIdRef.current) return;
      const sorted = [...payload.messages].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      setMessages(sorted);
    },
    []
  );

  // 3. 새 메시지 수신
  const handleNewMessage = useCallback(
    (message: Message & { roomId: string }) => {
      if (message.roomId !== roomIdRef.current) return;
      setMessages((prev) => [...prev, message]);
    },
    []
  );

  // 4. 소켓 이벤트 등록
  useEffect(() => {
    if (!roomIdRef.current) return;

    if (socket.connected) {
      handleConnect();
    } else {
      socket.off('connect', handleConnect).on('connect', handleConnect);
    }

    socket
      .off('roomMessages', handleRoomMessages)
      .on('roomMessages', handleRoomMessages);
    socket
      .off('newMessage', handleNewMessage)
      .on('newMessage', handleNewMessage);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('roomMessages', handleRoomMessages);
      socket.off('newMessage', handleNewMessage);
    };
  }, [handleConnect, handleRoomMessages, handleNewMessage]);

  // 5. 메시지 전송
  const handleSendMessage = () => {
    if (!input.trim() || !roomIdRef.current) return;
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

  if (!roomId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        채팅방을 선택해주세요
      </div>
    );
  }

  return (
    <div className="!pt-[100px] h-full overflow-y-hidden">
      <Button
        variant="outline"
        className="absolute top-4 z-50 border p-2 shadow-md opacity-70 hover:opacity-100"
        onClick={() => router.push(ROUTES.ADMIN.CHAT)}
      >
        <ArrowLeft />
      </Button>
      <ChatMessages
        isAdmin
        messages={messages}
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
