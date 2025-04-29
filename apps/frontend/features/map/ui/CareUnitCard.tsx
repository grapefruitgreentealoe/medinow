'use client';

import { CareUnit, CongestionLevel } from '@/shared/type';
import { useAtomValue, useSetAtom } from 'jotai';
import { chatModalAtom } from '@/features/chat/atoms/chatModalAtom';
import {
  Star,
  StarOff,
  MessageSquare,
  PhoneCallIcon,
  PencilIcon,
} from 'lucide-react';
import { openKakaoMap, renderTodayTime } from '../utils';
import { useOptimisticToggleFavorite } from '../model/useOptimisticToggleFavorite';
import { careUnitsQueryKeyAtom } from '../atoms/careUnitsQueryKeyAtom';
import { selectedCareUnitAtom } from '../atoms/selectedCareUnitAtom';
import {
  CATEGORY_LABEL,
  congestionClassMap,
} from '../../../shared/constants/const';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@/shared/constants/routes';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CareUnitCardLayout } from '@/shared/ui/CardLayout';

interface CareUnitCardProps {
  unit: CareUnit;
  onSelect: (unit: CareUnit) => void;
}

export function CareUnitCard({ unit, onSelect }: CareUnitCardProps) {
  const router = useRouter();
  const setChat = useSetAtom(chatModalAtom);
  const queryClient = useQueryClient();
  const queryKey = useAtomValue(careUnitsQueryKeyAtom);
  const cacheData = queryClient.getQueryData<any>(queryKey);

  const freshUnit =
    cacheData?.pages
      ?.flatMap((p: any) => p.items)
      ?.find((item: CareUnit) => item.id === unit.id) ?? unit;

  const { mutate: toggleFavorite } = useOptimisticToggleFavorite(queryKey);

  const handleUrlButton = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    openKakaoMap(unit);
  };

  const handleFavoriteButton = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    toggleFavorite({ unitId: unit.id });
  };

  const level = (unit?.congestion?.congestionLevel ?? 'LOW') as CongestionLevel;

  return (
    <CareUnitCardLayout title={unit.name} rounded={false}>
      {/* 별점 */}
      <div className="flex items-center gap-2 text-xs">
        <Star size={10} className="text-yellow-400 fill-yellow-400" />
        <span className="text-muted-foreground">
          {(unit.averageRating ?? 0).toFixed(1)}
        </span>
        <span className="text-muted-foreground">
          ({unit.reviewCount ?? 0}건)
        </span>
      </div>

      {/* 주소 */}
      <p className="text-sm text-muted-foreground leading-snug">
        {unit.address}
      </p>

      {/* 태그 */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge className="bg-muted text-muted-foreground">
          {CATEGORY_LABEL[unit.category]}
        </Badge>
        {unit?.congestion?.congestionLevel && (
          <Badge className={congestionClassMap[level]}>
            {unit.congestion.congestionLevel} (병상 수: {unit.congestion.hvec} )
          </Badge>
        )}
        <Badge className="rounded-xl text-muted-foreground bg-muted border">
          {unit.nowOpen ? '운영 중' : '운영 종료'}
        </Badge>
      </div>

      {/* 오늘 운영시간 */}
      <div className="text-xs text-muted-foreground">
        오늘 운영시간:{' '}
        <span className="text-foreground font-medium">
          {renderTodayTime(unit)}
        </span>
      </div>

      {/* 기능 버튼들 */}
      <div className="flex justify-between items-center pt-2">
        {/* 왼쪽: 길찾기, 상세보기 */}
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary text-xs"
            onClick={handleUrlButton}
          >
            길찾기
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary text-xs"
            onClick={() => onSelect(unit)}
          >
            상세보기
          </Button>
        </div>

        {/* 오른쪽: 즐겨찾기, 채팅, 리뷰쓰기 */}
        <div className="flex gap-2 items-center">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleFavoriteButton}
            className="w-8 h-8"
          >
            {freshUnit.isFavorite ? (
              <Star className="text-yellow-500 fill-yellow-500" size={18} />
            ) : (
              <Star size={18} />
            )}
          </Button>

          {unit.isChatAvailable && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                router.push(ROUTES.USER.CHAT(unit.id));
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
