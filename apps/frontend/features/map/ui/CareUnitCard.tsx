'use client';

import { CareUnit } from '@/features/map/type';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // tailwind helper (있다면)

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
  return (
    <Card
      key={unit.id}
      className={cn(
        'mb-3 cursor-pointer transition-shadow hover:shadow-md rounded-lg border'
      )}
      onClick={() => onSelect(unit)}
    >
      <CardContent className="p-4 space-y-2">
        <div className="space-y-0.5">
          <h3 className="text-lg font-bold">{unit.name}</h3>
          <p className="text-sm text-muted-foreground truncate">
            {unit.address}
          </p>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>📞 {unit.tel}</span>
          <span>{unit.isFavorite ? '⭐ 즐겨찾기' : ''}</span>
          <span>{unit.isChatAvailable ? '💬 채팅 가능' : '❌ 채팅 불가'}</span>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="link"
            className="text-xs text-blue-500 underline px-0"
            onClick={(e) => {
              e.stopPropagation();
              onOpenKakaoMap(unit);
            }}
          >
            카카오지도에서 보기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
