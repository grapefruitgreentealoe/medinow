'use client';

import { useAtom } from 'jotai';
import { chatModalAtom } from '../store/chatModalAtom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { DialogTitle } from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';

export function ChatModal() {
  const [chat, setChat] = useAtom(chatModalAtom);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  if (!chat.isOpen || !chat.target) return null;

  return (
      <Dialog
          
      open={chat.isOpen}
      onOpenChange={() => setChat({ isOpen: false, target: null })}
    >
      <DialogTitle>{chat.target.name}</DialogTitle>
          <DialogContent
              
        className={
          isMobile
            ? 'max-w-[90vw] rounded-xl p-4'
            : 'p-0 border-none bg-transparent shadow-none'
        }
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.2 }}
          className={`
            ${isMobile ? 'w-full' : 'fixed bottom-4 right-4 w-[360px]'}
            bg-white dark:bg-zinc-950 rounded-xl shadow-lg p-4 z-[200]
          `}
        >
          <div className="flex justify-between items-center">
            <strong>{chat.target.name}</strong>
            <button
              onClick={() => setChat({ isOpen: false, target: null })}
              className="text-sm text-muted-foreground cursor-pointer"
            >
              <XIcon />
            </button>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {chat.target.address}
          </div>
          <div className="mt-4 text-center text-sm">
            💬 채팅 기능은 곧 연결됩니다
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
