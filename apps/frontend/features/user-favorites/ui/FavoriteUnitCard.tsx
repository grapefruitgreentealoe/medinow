'use client';

import { CareUnit, CongestionLevel } from '@/features/map/type';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, PhoneCallIcon, Star, StarOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORY_LABEL, congestionClassMap } from '@/features/map/const';
import { openKakaoMap, renderTodayTime } from '@/features/map/utils';
interface Props {
  unit: CareUnit;
  onDetail: () => void;
  onToggleFavorite: () => void;
}

export function RichCareUnitCard({ unit, onDetail, onToggleFavorite }: Props) {
  const level = unit.congestion?.congestionLevel ?? 'LOW';

  return (
    <Card
      onClick={onDetail}
      className="cursor-pointer hover:shadow-md transition-shadow border border-slate-200 rounded-xl"
    >
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="text-base font-bold">{unit.name}</h3>
          <p className="text-sm text-muted-foreground">{unit.address}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-muted px-2 py-0.5 rounded-full">
            {CATEGORY_LABEL[unit.category]}
          </span>
          <span className={congestionClassMap[level as CongestionLevel]}>
            혼잡도: {level}
          </span>
          <span className="bg-muted px-2 py-0.5 rounded-full">
            {unit.nowOpen ? '🟢 운영 중' : '🔴 운영 종료'}
          </span>
          <span className="bg-muted px-2 py-0.5 rounded-full">
            ⭐ {unit.averageRating ?? 0}
          </span>
        </div>

        <div className="text-sm">
          ⏰ 오늘 운영시간:{' '}
          <span className="font-medium">{renderTodayTime(unit)}</span>
        </div>

        <div className="flex justify-between items-center pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs underline !px-0"
            onClick={(e) => {
              e.stopPropagation();
              openKakaoMap(unit);
            }}
          >
            길찾기
          </Button>
          <div className="flex gap-2">
            {unit.tel && (
              <a href={`tel:${unit.tel}`} onClick={(e) => e.stopPropagation()}>
                <Button size="icon" variant="ghost">
                  <PhoneCallIcon size={18} />
                </Button>
              </a>
            )}
            {unit.isChatAvailable && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => e.stopPropagation()}
              >
                <MessageSquare size={18} className="text-blue-500" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
