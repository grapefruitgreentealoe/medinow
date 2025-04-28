'use client';

import { useEffect, useState, useRef } from 'react';
import { socket } from '@/lib/socket';
import { MessageItem } from './MessageItem';
import { Input } from '@/components/ui/input'; // shadcn input!
import { Button } from '@/components/ui/button'; // shadcn button!

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  isAdmin: boolean;
  timestamp: string;
  isRead: boolean;
}

export function ChatRoom({
  careUnitId,
  roomId,
}: {
  careUnitId: string;
  roomId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!roomId) return;

    socket.connect();
    socket.emit('joinRoom', { roomId });

    socket.on('roomMessages', (initialMessages: Message[]) => {
      setMessages(initialMessages);
    });

    socket.on('newMessage', (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on(
      'userTyping',
      (data: {
        userId: string;
        userName: string;
        roomId: string;
        isTyping: boolean;
      }) => {
        if (data.roomId === roomId) {
          setIsOtherTyping(data.isTyping);
        }
      }
    );

    return () => {
      socket.emit('leaveRoom', { roomId });
      socket.off('roomMessages');
      socket.off('newMessage');
      socket.off('userTyping');
    };
  }, [roomId]);

  const handleSend = () => {
    if (!input.trim()) return;
    socket.emit('sendMessage', { roomId, content: input.trim() });
    socket.emit('typing', { roomId, isTyping: false }); // 보낼 때는 타이핑 멈춤
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    socket.emit('typing', { roomId, isTyping: true });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing', { roomId, isTyping: false });
    }, 2000); // 2초 동안 입력 없으면 타이핑 끝으로 간주
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}

        {isOtherTyping && (
          <div className="text-sm text-gray-500 animate-pulse px-2">
            상대방이 입력 중입니다...
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          type="text"
          placeholder="메시지를 입력하세요..."
          value={input}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={handleSend}>전송</Button>
      </div>
    </div>
  );
}
