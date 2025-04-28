'use client';

import { ScrollArea } from '@/components/ui/scroll-area';

export function ChatLayout({
  left,
  center,
  right,
}: {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <aside className="w-[20%] border-r border-gray-200">
        <ScrollArea className="h-full">{left}</ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col">{center}</main>

      <aside className="w-[20%] border-l border-gray-200">
        <ScrollArea className="h-full">{right}</ScrollArea>
      </aside>
    </div>
  );
}
