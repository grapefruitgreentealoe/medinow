'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { socket } from '@/lib/socket';
import { ChatMessages } from '@/features/chat/ui/ChatMessages';
import { Message } from '@/features/chat/type';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowLeftFromLineIcon } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const roomIdFromUrl = searchParams.get('id');
  const careUnitId = searchParams.get('careUnitId');
  const router = useRouter();

  const [messagesMap, setMessagesMap] = useState<Map<string, Message[]>>(
    new Map()
  );
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isRoomReady, setIsRoomReady] = useState(false);

  const roomIdRef = useRef<string | null>(null);
  const hasJoinedRef = useRef(false);

  /** 방 입장 후 받은 roomId 저장 */
  const handleRoomResolved = useCallback((data: { roomId: string }) => {
    roomIdRef.current = data.roomId;
    setIsRoomReady(true);
    router.push(`/user/chat?id=${data.roomId}`);
  }, []);

  /** 방 전체 메시지 받아서 저장 */
  const handleRoomMessages = useCallback(
    (payload: { messages: Message[]; roomId: string }) => {
      console.log('handleRoomMessages', payload);
      const { roomId, messages } = payload;
      const sorted = [...messages].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(roomId, sorted);
        return newMap;
      });
    },
    []
  );

  /** 새로운 단일 메시지 추가 */
  const handleNewMessage = useCallback(
    (message: Message & { roomId: string }) => {
      if (!roomIdRef.current || message.roomId !== roomIdRef.current) {
        console.warn(`다른 방(${message.roomId}) 메시지 무시`);
        return;
      }

      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        const currentMessages = newMap.get(message.roomId) || [];
        newMap.set(message.roomId, [...currentMessages, message]);
        return newMap;
      });
    },
    []
  );

  useEffect(() => {
    // emit보다 항상 먼저 등록되도록 보장
    socket
      .off('roomMessages', handleRoomMessages)
      .on('roomMessages', handleRoomMessages);
    socket
      .off('newMessage', handleNewMessage)
      .on('newMessage', handleNewMessage);
    socket
      .off('roomCreated', handleRoomResolved)
      .on('roomCreated', handleRoomResolved);

    return () => {
      socket.off('roomMessages', handleRoomMessages);
      socket.off('newMessage', handleNewMessage);
      socket.off('roomCreated', handleRoomResolved);
    };
  }, [handleRoomMessages, handleNewMessage, handleRoomResolved]);

  /** 소켓 이벤트 등록 및 해제 */
  useEffect(() => {
    if (!roomIdFromUrl && !careUnitId) return;
    if (hasJoinedRef.current) return;

    hasJoinedRef.current = true;

    if (roomIdFromUrl) {
      socket.emit('joinRoom', { roomId: roomIdFromUrl });
      roomIdRef.current = roomIdFromUrl;
      setIsRoomReady(true);
    } else if (careUnitId) {
      socket.emit('joinRoom', { careUnitId });
    }
  }, [
    roomIdFromUrl,
    careUnitId,
    handleRoomResolved,
    handleRoomMessages,
    handleNewMessage,
  ]);

  const handleSendMessage = () => {
    if (!roomIdRef.current || !isRoomReady) {
      console.warn('❌ 방 준비 안 됨');
      return;
    }

    if (!input.trim()) return;

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

  const currentMessages = messagesMap.get(roomIdRef.current || '') || [];

  if (!roomIdFromUrl && !careUnitId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        채팅방을 선택하거나, 의료기관 목록으로부터 채팅을 시작하세요
      </div>
    );
  }

  return (
    <div className="!pt-[100px] h-full overflow-y-hidden">
      <Button
        variant="outline"
        className="absolute top-4 z-50 border p-2 shadow-md opacity-70 hover:opacity-100"
        onClick={() => router.push(ROUTES.USER.CHAT_LIST)}
      >
        <ArrowLeft />
      </Button>

      <ChatMessages
        messages={currentMessages}
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
