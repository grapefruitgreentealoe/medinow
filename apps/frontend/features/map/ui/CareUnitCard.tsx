'use client';

import { CareUnit, CongestionLevel } from '@/shared/type';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
import { CATEGORY_LABEL, congestionClassMap } from '../const';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@/shared/constants/routes';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

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
    <Card
      key={unit.id}
      className={cn(
        'mb-4 hover:shadow-md bg-background transition-shadow rounded-none border-t-0 border-l-0 border-r-0 border-b-[1px] border-b-slate-300 border-solid'
      )}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '64px' }}
    >
      <CardContent className="!p-5 space-y-4">
        {/* 제목 + 주소 */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-primary">{unit.name}</h3>
          <div className="flex items-center gap-2 text-xs mt-2">
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <span className="text-muted-foreground">
              {(unit.averageRating ?? 0).toFixed(1)}
            </span>
            <span className="text-muted-foreground">
              ({unit.reviewCount ?? 0}건)
            </span>
          </div>

          <p className="text-sm text-muted-foreground leading-snug">
            {unit.address}
          </p>
        </div>

        {/* 태그들 */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="bg-muted text-muted-foreground !px-2 !py-0.5 rounded-full">
            {CATEGORY_LABEL[unit.category]}
          </span>
          {unit?.congestion?.congestionLevel && (
            <span className={congestionClassMap[level]}>혼잡도: {level}</span>
          )}
          <Badge
            className={'!p-1 rounded-xl  text-muted-foreground bg-muted border'}
          >
            {unit.nowOpen ? '운영 중' : '운영 종료'}
          </Badge>
        </div>

        {/* 운영시간 */}
        <div className="text-xs !mt-1 text-muted-foreground">
          오늘 운영시간:{' '}
          <span className="text-foreground font-medium">
            {renderTodayTime(unit)}
          </span>
        </div>

        {/* 기능 버튼 */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-2 items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary text-xs !px-0"
              onClick={handleUrlButton}
            >
              길찾기
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary text-xs !px-0"
              onClick={() => onSelect(unit)}
            >
              상세보기
            </Button>
          </div>

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
                router.push(
                  ROUTES.USER.WRITE_REVIEW + `?careUnitId=${unit.id}`
                );
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
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="w-8 h-8"
                >
                  <PhoneCallIcon className="text-slate-500" size={18} />
                </Button>
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
