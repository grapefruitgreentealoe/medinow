'use client';

import { CareUnit } from '@/features/map/type';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
      className="mb-2 cursor-pointer hover:bg-gray-50"
      onClick={() => onSelect(unit)}
    >
      <CardContent className="p-3 space-y-1">
        <h3 className="text-base font-semibold">{unit.name}</h3>
        <p className="text-sm text-muted-foreground">{unit.address}</p>
        <div className="text-xs flex justify-between">
          <span>📞 {unit.tel}</span>
          <span>{unit.isFavorite ? '⭐ 즐겨찾기' : ''}</span>
          <span>{unit.isChatAvailable ? '💬 채팅 가능' : '❌ 채팅 불가'}</span>
        </div>
        <Button
          variant="link"
          className="text-xs text-blue-500 underline"
          onClick={(e) => {
            e.stopPropagation();
            onOpenKakaoMap(unit);
          }}
        >
          카카오지도에서 보기
        </Button>
      </CardContent>
    </Card>
  );
}
