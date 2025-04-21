'use client';

import { useSetAtom } from 'jotai';
import { chatModalAtom } from '../store/chatModalAtom';
import { Button } from '@/components/ui/button';

export function FloatingChatButton() {
  const setChat = useSetAtom(chatModalAtom);

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      <Button
        className="rounded-full shadow-lg p-4 text-white bg-primary"
        onClick={() => setChat({ isOpen: true, target: null })}
      >
        💬
      </Button>
    </div>
  );
}
