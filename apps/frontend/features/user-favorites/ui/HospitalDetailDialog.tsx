'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import { selectedFavoriteCareUnitAtom } from '../atoms/selectedFavoriteCareUnitAtom';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORY_LABEL } from '@/shared/constants/const';
import { ContentDialog } from '@/shared/ui/ContentDialog';
import { useRenderTimeRow } from '@/shared/model/useRenderTimeRow';
import { HospitalTimeTable } from '@/shared/ui/HospitalTimeTable';

export function HospitalDetailDialog() {
  const unit = useAtomValue(selectedFavoriteCareUnitAtom);
  const setSelected = useSetAtom(selectedFavoriteCareUnitAtom);

  if (!unit) return null;

  return (
    <ContentDialog
      open={!!unit}
      onClose={() => setSelected(null)}
      title="의료기관 상세 정보"
      hideFooter
    >
      <div className="!space-y-4 text-sm leading-relaxed">
        {/* 의료기관명 + 운영 상태 */}
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold">{unit.name}</h2>
          <Badge className="bg-muted text-muted-foreground">
            {CATEGORY_LABEL[unit.category]}
          </Badge>
          <Badge className="bg-muted text-muted-foreground">
            {unit.nowOpen ? '운영 중' : '운영 종료'}
          </Badge>
        </div>

        {/* 주소, 전화번호 */}
        <div className="space-y-1 flex flex-col">
          <div className="inline-flex items-center gap-1 text-muted-foreground">
            <MapPin size={16} />
            <span>{unit.address}</span>
          </div>
          {unit.tel && (
            <div className="inline-flex items-center gap-1 text-muted-foreground">
              <a href={`tel:${unit.tel}`} className="text-blue-600 underline">
                {unit.tel}
              </a>
            </div>
          )}
        </div>

        {/* 혼잡도 */}
        {unit.congestion && (
          <div>
            <div className="font-medium">혼잡도</div>
            <div
              className={cn(
                'font-semibold',
                unit.congestion.congestionLevel === 'HIGH'
                  ? 'text-red-600'
                  : unit.congestion.congestionLevel === 'MEDIUM'
                    ? 'text-yellow-600'
                    : 'text-green-600'
              )}
            >
              {unit.congestion.congestionLevel} (병상 수: {unit.congestion.hvec}
              )
            </div>
          </div>
        )}

        {/* 진료과 */}
        {unit.departments?.length > 0 && (
          <div>
            <div className="font-medium">진료과</div>
            <div className="flex flex-wrap gap-2">
              {unit.departments.map((dept, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs rounded-2xl"
                >
                  {dept?.name ?? dept}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 운영시간 */}
        <div>
          <div className="text-md font-semibold mb-2">운영시간</div>
          <HospitalTimeTable unit={unit} />
        </div>
      </div>
    </ContentDialog>
  );
}
