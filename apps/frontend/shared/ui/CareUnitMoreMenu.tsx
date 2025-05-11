'use client';

import { CareUnit } from '@/shared/type';
import { ROUTES } from '@/shared/constants/routes';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';

interface CareUnitMoreMenuProps {
  unit: CareUnit;
  onClickFavorite?: (e: React.MouseEvent) => void;
}

export function CareUnitMoreMenu({
  unit,
  onClickFavorite,
}: CareUnitMoreMenuProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="w-8 h-8">
          <MoreVertical size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onClickFavorite && (
          <DropdownMenuItem onClick={onClickFavorite}>
            {unit.isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
          </DropdownMenuItem>
        )}

        {unit.isChatAvailable && (
          <DropdownMenuItem
            onClick={(e) => {
              router.push(ROUTES.USER.CHAT(unit.id));
            }}
          >
            채팅하기
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={(e) => {
            router.push(`${ROUTES.USER.WRITE_REVIEW}?careUnitId=${unit.id}`);
          }}
        >
          리뷰쓰기
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            navigator.clipboard
              .writeText(`${window.location.origin}/?careUnitId=${unit.id}`)
              .then(() => toast.success('링크가 복사되었습니다!'))
              .catch(() => toast.error('링크 복사에 실패했습니다.'));
          }}
        >
          링크 복사
        </DropdownMenuItem>

        {unit.tel && (
          <DropdownMenuItem
            onClick={(e) => {
              window.location.href = `tel:${unit.tel}`;
            }}
          >
            전화하기
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
