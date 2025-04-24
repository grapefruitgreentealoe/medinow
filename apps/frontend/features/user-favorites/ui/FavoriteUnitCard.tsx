'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, StarOff, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/constants/routes';
import { CareUnit } from '@/features/map/type';

interface Props {
  unit: CareUnit;
  onToggleFavorite: (id: string) => void;
  onDetail: () => void;
}

export function RichCareUnitCard({ unit, onToggleFavorite, onDetail }: Props) {
  const router = useRouter();

  return (
    <Card
      className="p-4 w-full space-y-3 border rounded-lg shadow-sm"
      onClick={onDetail}
    >
      {/* 병원명 + 운영중 뱃지 */}
      <div className="flex justify-between items-start">
        <div className="text-base font-bold text-primary">{unit.name}</div>
        <Badge
          variant={unit.nowOpen ? 'default' : 'outline'}
          className={
            unit.nowOpen
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-gray-300 text-gray-600'
          }
        >
          {unit.nowOpen ? '운영 중' : '운영 종료'}
        </Badge>
      </div>

      {/* 주소 */}
      <div className="flex items-center text-sm text-muted-foreground">
        <MapPin className="w-4 h-4 mr-1" />
        <a
          href={`https://map.kakao.com/?q=${unit.name}&road_address_name=${unit.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary"
        >
          {unit.address}
        </a>
      </div>

      {/* 평점 */}
      <div className="text-sm flex items-center gap-1">
        {'★'.repeat(Math.floor(unit.rating)) +
          '☆'.repeat(5 - Math.floor(unit.rating))}
        <span className="ml-1 font-medium">{unit.rating.toFixed(1)}</span>
        <span className="text-muted-foreground">({unit.reviewCount})</span>
      </div>

      {/* 진료과목 */}
      <div className="flex flex-wrap gap-2">
        {unit.departments.map((tag) => (
          <Badge key={tag} variant="outline" className="text-sm">
            {tag}
          </Badge>
        ))}
      </div>

      {/* 버튼 + 즐찾 */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-2">
          <Button size="sm">상세 정보</Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`${ROUTES.USER.WRITE_REVIEW}?careUnitId=${unit.id}`); //
            }}
          >
            리뷰 작성
          </Button>
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => onToggleFavorite(unit.id)}
          className="w-8 h-8"
        >
          {unit.rating ? (
            <Star className="text-yellow-500 fill-yellow-500" />
          ) : (
            <StarOff />
          )}
        </Button>
      </div>
    </Card>
  );
}
