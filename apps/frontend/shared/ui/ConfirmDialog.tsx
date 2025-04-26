'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useFixBodyMargin } from '../model/useFixedBodyMargin';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  confirmVariant = 'default',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose} modal>
      <DialogOverlay className="bg-black/10 backdrop-blur-sm" />

      <DialogContent>
        <DialogHeader>
          <p className="text-lg font-semibold">{title}</p>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mt-2">{description}</p>

        <DialogFooter className="mt-4 flex gap-2 justify-end">
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmText}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
