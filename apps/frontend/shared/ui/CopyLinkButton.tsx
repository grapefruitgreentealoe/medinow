'use client';

import { Button } from '@/components/ui/button';
import { LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useCallback } from 'react';

interface CopyLinkButtonProps {
  careUnitId: string;
}

export function CopyLinkButton({ careUnitId }: CopyLinkButtonProps) {
  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      try {
        const url = new URL(window.location.href);
        url.searchParams.set('careUnitId', careUnitId);

        navigator.clipboard.writeText(url.toString()).then(() => {
          toast.success('링크가 복사되었습니다!');
        });
      } catch (error) {
        toast.error('링크 복사에 실패했습니다.');
      }
    },
    [careUnitId]
  );

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={handleCopy}
      className="w-8 h-8"
    >
      <LinkIcon className="text-muted-foreground" size={18} />
    </Button>
  );
}
