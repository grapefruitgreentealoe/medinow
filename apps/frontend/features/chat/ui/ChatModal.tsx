'use client';

import { useAtom } from 'jotai';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChatRoomUI } from './ChatRoomUI'; // 아래에서 만들 컴포넌트
import { chatModalAtom } from '../atoms/chatModalAtom';

export function ChatModal() {
  const [chat, setChat] = useAtom(chatModalAtom);

  if (!chat.isOpen || !chat.target) return null;

  return (
    <Dialog
      open={chat.isOpen}
      onOpenChange={() => setChat({ isOpen: false, target: null })}
    >
      <DialogContent className="w-full max-w-xl h-[80vh]">
        <ChatRoomUI careUnit={chat.target} />
      </DialogContent>
    </Dialog>
  );
}
