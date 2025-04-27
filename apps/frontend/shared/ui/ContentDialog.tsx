'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';
import { DialogTitle } from '@radix-ui/react-dialog';

interface ContentDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  ctaText?: string;
  onCtaClick?: () => void;
  showCtaButton?: boolean;
  hideFooter?: boolean;
}

export function ContentDialog({
  open,
  onClose,
  title,
  children,
  ctaText = '확인',
  onCtaClick,
  showCtaButton = true,
  hideFooter = false,
}: ContentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose} modal>
      <DialogOverlay className="bg-black/10 backdrop-blur-sm" />

      <DialogContent className="w-fit min-w-[300px] gap-0 bg-background text-foreground text-sm leading-relaxed">
        <DialogTitle className="mb-2 !gap-1 text-primary">
          <p className="text-xl font-bold">{title}</p>
        </DialogTitle>

        <div className="!mt-4 !space-y-4 text-sm text-foreground">
          {children}
        </div>

        {!hideFooter && (
          <DialogFooter className="!mt-6 flex gap-2 justify-end">
            {showCtaButton && onCtaClick && (
              <Button onClick={onCtaClick}>{ctaText}</Button>
            )}
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
