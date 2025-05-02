'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';
import type { ChatMessage, Message } from '@/features/chat/type';

interface ChatMessagesProps {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  isAdmin?: boolean;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
}

export function ChatMessages({
  isAdmin = false,
  messages,
  input,
  setInput,
  onSendMessage,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto !p-4 !space-y-2">
        {messages.map((msg) => {
          const isRight = isAdmin ? msg.isAdmin : !msg.isAdmin;

          return (
            <div
              key={msg.id}
              className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`relative !p-3 rounded-lg max-w-xs text-sm
                  ${isRight ? 'bg-primary text-white !mr-2' : 'bg-amber-50 text-foreground !ml-2'}
                  before:absolute before:top-2.5 before:w-0 before:h-0
                  ${
                    isRight
                      ? 'before:right-[-6px] before:border-l-[6px] before:border-l-primary before:border-t-[6px] before:border-t-transparent before:border-b-[6px] before:border-b-transparent'
                      : 'before:left-[-6px] before:border-r-[6px] before:border-r-amber-50 before:border-t-[6px] before:border-t-transparent before:border-b-[6px] before:border-b-transparent'
                  }
                `}
              >
                <div>{msg.content}</div>
                <div className="text-[10px] text-right !mt-1 opacity-60">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="!p-2 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요"
          onKeyDown={onKeyDown}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
        />
        <Button onClick={onSendMessage}>전송</Button>
      </div>
    </div>
  );
}
