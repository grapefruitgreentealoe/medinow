'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ChatMessages() {
  const messages = [
    { id: 1, sender: 'hospital', content: 'Our ER is available now.' },
    { id: 2, sender: 'me', content: 'Thank you. I will arrive soon.' },
  ];

  return (
    <div className="flex flex-col flex-1">
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-xs p-3 rounded-lg ${
                msg.sender === 'me'
                  ? 'ml-auto bg-primary text-white'
                  : 'mr-auto bg-muted'
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-4 flex gap-2">
        <Input placeholder="메시지를 입력하세요..." className="flex-1" />
        <Button>전송</Button>
      </div>
    </div>
  );
}
