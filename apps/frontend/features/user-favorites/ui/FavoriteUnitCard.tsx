'use client';

import { CareUnit, CongestionLevel } from '@/shared/type';
import { useSetAtom } from 'jotai';
import { unfavoriteConfirmUnitAtom } from '../atoms/unfavoriteConfirmModalAtom';
import { openKakaoMap, renderTodayTime } from '@/features/map/utils';
import { CATEGORY_LABEL, congestionClassMap } from '@/shared/constants/const';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { CareUnitCardLayout } from '@/shared/ui/CardLayout';
import { CareUnitMoreMenu } from '@/shared/ui/CareUnitMoreMenu';

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
          <Badge className={congestionClassMap[level]}>혼잡도: {level}</Badge>
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
        <CareUnitMoreMenu unit={unit} onClickFavorite={handleFavoriteButton} />
      </div>
    </CareUnitCardLayout>
  );
}
