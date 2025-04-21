'use client';

import { FloatingChatButton } from '@/features/chat/ui/FloatingChatButton';
import { ChatModal } from '@/features/chat/ui/ChatModal';
export function FloatingChatWidget() {
  return (
    <>
      <FloatingChatButton />
      <ChatModal />
    </>
  );
}
