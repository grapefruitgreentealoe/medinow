'use client';

import { CareUnit } from '@/features/map/type';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { useSetAtom } from 'jotai';
import { chatModalAtom } from '@/features/chat/atoms/chatModalAtom';
import { Star, StarOff, MessageSquare } from 'lucide-react';
import { useToggleFavorite } from '../model/useOnToggleFavorite';
import { renderTodayTime } from '../utils';
import { useState } from 'react';

interface CareUnitCardProps {
  unit: CareUnit;
  onSelect: (unit: CareUnit) => void;
  onOpenKakaoMap: (unit: CareUnit) => void;
}

export function CareUnitCard({
  unit,
  onSelect,
  onOpenKakaoMap,
}: CareUnitCardProps) {
  const setChat = useSetAtom(chatModalAtom);
  const { mutate: toggleFavoriteMutation } = useToggleFavorite();
  const [localFavorite, setLocalFavorite] = useState(unit.isFavorite);
  const handleUrlButton = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onOpenKakaoMap(unit);
  };

  const handleFavoriteButton = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    console.log('yup', unit.id, unit.isFavorite);
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
        'mb-3 cursor-pointer transition-shadow hover:shadow-md rounded-lg border'
      )}
      onClick={() => onSelect(unit)}
    >
      <CardContent className="p-4 space-y-2">
        {/* 제목, 주소 */}
        <div className="space-y-0.5">
          <h3 className="text-lg font-bold">{unit.name}</h3>
          <p className="text-sm text-muted-foreground truncate">
            {unit.address}
          </p>
        </div>

        {/* 혼잡도, 운영 여부, 카테고리 */}
        <div className="text-xs flex flex-wrap gap-2 mt-2">
          <span className="bg-gray-100 px-2 py-0.5 rounded-full">
            🏥 {unit.category}
          </span>
          {unit?.congestion ? (
            <span
              className={cn(
                'px-2 py-0.5 rounded-full',
                unit.congestion.congestionLevel === 'HIGH'
                  ? 'bg-red-100 text-red-600'
                  : unit.congestion.congestionLevel === 'MEDIUM'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-green-100 text-green-600'
              )}
            >
              혼잡도: {unit.congestion.congestionLevel}
            </span>
          ) : null}
          <span className="bg-gray-100 px-2 py-0.5 rounded-full">
            {unit.nowOpen ? '🟢 운영 중' : '🔴 운영 종료'}
          </span>
          <p className="text-xs text-muted-foreground">
            ⏰ 오늘 운영시간: {renderTodayTime(unit)}
          </p>
        </div>

        {/* 기능 버튼들 */}
        <div className="flex justify-between items-center pt-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 text-xs underline px-0"
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
                <Star
                  className="text-yellow-500 fill-yellow-500"
                  size={18}
                  color="text-yellow-500"
                />
              ) : (
                <StarOff size={18} />
              )}
            </Button>

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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
