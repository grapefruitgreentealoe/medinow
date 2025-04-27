'use client';

import { CareUnit, CongestionLevel } from '@/shared/type';
import { useAtomValue, useSetAtom } from 'jotai';
import { chatModalAtom } from '@/features/chat/atoms/chatModalAtom';
import { unfavoriteConfirmUnitAtom } from '../atoms/unfavoriteConfirmModalAtom';
import { openKakaoMap, renderTodayTime } from '@/features/map/utils';
import { CATEGORY_LABEL, congestionClassMap } from '@/features/map/const';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/constants/routes';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  StarOff,
  MessageSquare,
  PhoneCallIcon,
  PencilIcon,
} from 'lucide-react';
import { CareUnitCardLayout } from '@/shared/ui/CardLayout';

interface CareUnitCardProps {
  unit: CareUnit;
  onSelect: (unit: CareUnit) => void;
  onConfirmUnfavorite: () => void;
  currentPage: number;
}

export function CareUnitCard({
  unit,
  onSelect,
  onConfirmUnfavorite,
}: CareUnitCardProps) {
  const setConfirmUnit = useSetAtom(unfavoriteConfirmUnitAtom);
  const setChat = useSetAtom(chatModalAtom);
  const router = useRouter();

  const handleFavoriteButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (unit.isFavorite) {
      setConfirmUnit(unit);
      onConfirmUnfavorite();
    }
  };

  const handleUrlButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    openKakaoMap(unit);
  };

  const level = (unit?.congestion?.congestionLevel ?? 'LOW') as CongestionLevel;

  return (
    <CareUnitCardLayout title={unit.name}>
      {/* 주소 */}
      <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
        {unit.address}
      </p>

      {/* 태그들 */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge className="bg-muted text-muted-foreground">
          {CATEGORY_LABEL[unit.category]}
        </Badge>
        {unit?.congestion?.congestionLevel && (
          <span className={congestionClassMap[level]}>혼잡도: {level}</span>
        )}
        <Badge className="text-muted-foreground bg-muted">
          {unit.nowOpen ? '운영 중' : '운영 종료'}
        </Badge>
      </div>

      {/* 오늘 운영시간 */}
      <div className="text-sm text-muted-foreground">
        오늘 운영시간:{' '}
        <span className="text-foreground font-medium">
          {renderTodayTime(unit)}
        </span>
      </div>

      {/* 기능 버튼 */}
      <div className="flex justify-between items-center pt-2">
        {/* 왼쪽 버튼 */}
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary text-xs "
            onClick={handleUrlButton}
          >
            길찾기
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary text-xs "
            onClick={() => onSelect(unit)}
          >
            상세보기
          </Button>
        </div>

        {/* 오른쪽 버튼 */}
        <div className="flex gap-2 items-center">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleFavoriteButton}
            className="w-8 h-8"
          >
            {unit.isFavorite ? (
              <Star className="text-yellow-500 fill-yellow-500" size={18} />
            ) : (
              <StarOff size={18} />
            )}
          </Button>

          {unit.isChatAvailable && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setChat({ isOpen: true, target: unit });
              }}
              className="w-8 h-8"
            >
              <MessageSquare className="text-blue-500" size={18} />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              router.push(ROUTES.USER.WRITE_REVIEW + `?careUnitId=${unit.id}`);
            }}
            className="w-8 h-8"
          >
            <PencilIcon className="text-blue-500" size={18} />
          </Button>

          {unit.tel && (
            <a href={`tel:${unit.tel}`}>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8"
              >
                <PhoneCallIcon className="text-slate-500" size={18} />
              </Button>
            </a>
          )}
        </div>
      </div>
    </CareUnitCardLayout>
  );
}
