'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { socket } from '@/lib/socket';
import { ChatMessages } from '@/features/chat/ui/ChatMessages';
import { Message } from '@/features/chat/type';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('id'); // URL에서 가져오는 roomId

  const [messagesMap, setMessagesMap] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    socket.connect();

    const handleConnect = () => {
      console.log('Socket connected!');
      socket.emit('joinRoom', { roomId });
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on('connect', handleConnect);
    }

    socket.on(
      'roomMessages',
      (payload: { messages: Message[]; roomId: string }) => {
        console.log('admin roomMessages', payload.messages);
        const sortedMessages = [...payload.messages].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setMessagesMap(sortedMessages);
      }
    );

    socket.on('newMessage', (message: Message) => {
      console.log('newMessage', message);
      setMessagesMap((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
      socket.off('connect', handleConnect);
      socket.off('roomMessages');
      socket.off('newMessage');
    };
  }, [roomId]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    if (!roomId) {
      console.warn('roomId가 없습니다.');
      return;
    }

    socket.emit('sendMessage', { roomId, content: input });
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
