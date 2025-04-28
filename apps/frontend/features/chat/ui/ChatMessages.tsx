'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';
import type { Message } from '@/features/chat/type';
import { cn } from '@/lib/utils';

interface ChatMessagesProps {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
}

export function ChatMessages({
  messages,
  input,
  setInput,
  onSendMessage,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('inner', messages);
    // bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex',
              msg.senderId === 'me' ? 'justify-end' : 'justify-start' // ✅ 나면 오른쪽, 상대면 왼쪽
            )}
          >
            <div
              className={cn(
                'p-3 rounded-lg max-w-xs',
                msg.senderId === 'me'
                  ? 'bg-primary text-primary-foreground' // ✅ 내가 보낸건 파란색 등 강조
                  : 'bg-muted text-muted-foreground' // 상대방은 회색
              )}
            >
              <div>{msg.content}</div>
              <div className="text-[10px] text-right mt-1 opacity-60">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="p-2 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSendMessage();
          }}
        />
        <Button onClick={onSendMessage}>전송</Button>
      </div>
    </div>
  );
}
