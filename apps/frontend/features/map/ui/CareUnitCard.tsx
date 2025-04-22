'use client';

import { CareUnit } from '@/features/map/type';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSetAtom } from 'jotai';
import { chatModalAtom } from '@/features/chat/atoms/chatModalAtom';
import {
  Star,
  StarOff,
  MessageSquare,
  TelescopeIcon,
  PhoneCallIcon,
} from 'lucide-react';
import { useToggleFavorite } from '../model/useOnToggleFavorite';
import { openKakaoMap, renderTodayTime } from '../utils';
import { useState } from 'react';

interface CareUnitCardProps {
  unit: CareUnit;
  onSelect: (unit: CareUnit) => void;
}

export function CareUnitCard({ unit, onSelect }: CareUnitCardProps) {
  const setChat = useSetAtom(chatModalAtom);
  const { mutate: toggleFavoriteMutation } = useToggleFavorite();
  const [localFavorite, setLocalFavorite] = useState(unit.isFavorite);

  const handleUrlButton = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    openKakaoMap(unit);
  };

  const handleFavoriteButton = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    toggleFavoriteMutation(
      {
        unitId: unit.id,
        next: !unit.isFavorite,
      },
      {
        onError: () => {
          setLocalFavorite((o) => !o);
        },
        onSuccess: () => {
          setLocalFavorite((o) => !o);
        },
      }
    );
  };
  return (
    <Card
      key={unit.id}
      className={cn(
        'mb-4 cursor-pointer hover:shadow-md bg-background transition-shadow rounded-none border-t-0 border-l-0 bordeer-r-0 border-b-[1px] border-b-slate-300 border-solid'
      )}
      onClick={() => onSelect(unit)}
    >
      <CardContent className="!p-5 space-y-4">
        {/* 제목 + 주소 */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-primary">{unit.name}</h3>
          <p className="text-sm text-muted-foreground leading-snug">
            {unit.address}
          </p>
        </div>

        {/* 태그들 */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="bg-muted text-muted-foreground !px-2 !py-0.5 rounded-full">
            {unit.category === 'emergency'
              ? '응급실'
              : unit.category === 'pharmacy'
                ? '약국'
                : '병원'}
          </span>
          {unit?.congestion && (
            <span
              className={cn(
                '!px-2 !py-0.5 rounded-full',
                unit?.congestion?.congestionLevel === 'HIGH'
                  ? 'bg-red-100 text-red-600'
                  : unit?.congestion?.congestionLevel === 'MEDIUM'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-green-100 text-green-600'
              )}
            >
              혼잡도: {unit?.congestion?.congestionLevel}
            </span>
          )}
          <span className="bg-muted text-muted-foreground !px-2 !py-0.5 rounded-full">
            {unit.nowOpen ? '🟢 운영 중' : '🔴 운영 종료'}
          </span>
        </div>

        {/* 운영시간 */}
        <div className="text-sm text-muted-foreground">
          ⏰ 오늘 운영시간:{' '}
          <span className="text-foreground font-medium">
            {renderTodayTime(unit)}
          </span>
        </div>

        {/* 기능 버튼 */}
        <div className="flex justify-between items-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary text-xs underline !px-0"
            onClick={handleUrlButton}
          >
            카카오지도에서 보기
          </Button>

          <div className="flex gap-2 items-center">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleFavoriteButton}
              className="w-8 h-8"
            >
              {localFavorite ? (
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
            {unit.tel && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="w-8 h-8"
              >
                <a href={`tel:${unit.tel}`}>
                  <PhoneCallIcon className="text-slate-500" size={18} />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
