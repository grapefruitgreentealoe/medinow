'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import { selectedFavoriteCareUnitAtom } from '../atoms/selectedFavoriteCareUnitAtom';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORY_LABEL } from '@/features/map/const';
import { ContentDialog } from '@/shared/ui/ContentDialog';

export function HospitalDetailDialog() {
  const unit = useAtomValue(selectedFavoriteCareUnitAtom);
  const setSelected = useSetAtom(selectedFavoriteCareUnitAtom);

  if (!unit) return null;

  const timeToStr = (time: number | null) => {
    if (time === 0) return '00:00';
    if (!time) return '휴무';
    const h = String(Math.floor(time / 100)).padStart(2, '0');
    const m = String(time % 100).padStart(2, '0');
    return `${h}:${m}`;
  };

  const renderTimeRow = (
    label: string,
    open: number | null,
    close: number | null
  ) => (
    <>
      <div className="text-muted-foreground">{label}</div>
      <div>
        {timeToStr(open)} - {timeToStr(close)}
      </div>
    </>
  );

  return (
    <ContentDialog
      open={!!unit}
      onClose={() => setSelected(null)}
      title="병원 상세 정보"
      hideFooter
    >
      <div className="!space-y-4 text-sm leading-relaxed">
        {/* 병원명 + 운영 상태 */}
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold">{unit.name}</h2>
          <Badge className="!p-1 rounded-2xl bg-muted text-muted-foreground">
            {CATEGORY_LABEL[unit.category]}
          </Badge>
          <Badge className="!p-1 rounded-xl bg-muted text-muted-foreground border">
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
              {unit.congestion.congestionLevel} ({unit.congestion.hvec} 병상)
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
                  className="text-xs !px-2 rounded-2xl"
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
          <div className="grid grid-cols-[80px_1fr] gap-y-1 gap-x-4">
            {renderTimeRow('월요일', unit.mondayOpen, unit.mondayClose)}
            {renderTimeRow('화요일', unit.tuesdayOpen, unit.tuesdayClose)}
            {renderTimeRow('수요일', unit.wednesdayOpen, unit.wednesdayClose)}
            {renderTimeRow('목요일', unit.thursdayOpen, unit.thursdayClose)}
            {renderTimeRow('금요일', unit.fridayOpen, unit.fridayClose)}
            {renderTimeRow('토요일', unit.saturdayOpen, unit.saturdayClose)}
            {renderTimeRow('일요일', unit.sundayOpen, unit.sundayClose)}
            {renderTimeRow('공휴일', unit.holidayOpen, unit.holidayClose)}
          </div>
        </div>
      </div>
    </ContentDialog>
  );
}
