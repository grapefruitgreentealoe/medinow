'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star } from 'lucide-react';
import { useAtomValue, useSetAtom } from 'jotai';
import { ReviewList } from '@/features/review/ui/ReviewList';
import { selectedFavoriteCareUnitAtom } from '../atoms/selectedFavoriteCareUnitAtom';
import { cn } from '@/lib/utils';
import { CATEGORY_LABEL } from '@/features/map/const';

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
    <Dialog
      open={!!unit}
      onOpenChange={(open) => {
        if (!open) setSelected(null);
      }}
    >
      <DialogOverlay className="bg-black/10 backdrop-brightness-75" />
      <DialogContent className=" w-fit !p-8 gap-0 bg-background text-foreground text-sm leading-relaxed">
        {/* 병원명 + 운영 상태 */}
        <DialogHeader className="mb-2 gap-1">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {unit.name}
            <Badge
              variant={unit.nowOpen ? 'default' : 'outline'}
              className="!p-1 rounded-2xl"
            >
              {CATEGORY_LABEL[unit.category]}
            </Badge>
            <Badge
              variant={unit.nowOpen ? 'default' : 'outline'}
              className={cn(
                unit.nowOpen
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-300 text-gray-600',
                '!p-1 rounded-2xl'
              )}
            >
              {unit.nowOpen ? '운영 중' : '운영 종료'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* 주소 */}
        <div>
          <div className="inline-flex items-center gap-1 text-muted-foreground">
            <MapPin size={16} />
            <span className="whitespace-nowrap">{unit.address}</span>
          </div>
          {/* 전화번호 */}
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
          <div className="space-y-1">
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
          <div className="space-y-1 !mt-5">
            <div className="font-medium">진료과</div>
            <div className="flex flex-wrap gap-2">
              {unit.departments.slice(0, 3).map((dept, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs !px-2 rounded-2xl"
                >
                  {dept?.name ?? dept}
                </Badge>
              ))}

              {unit.departments.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 !px-2 rounded-2xl text-xs text-muted-foreground"
                >
                  +{unit.departments.length - 3}개
                </Button>
              )}
            </div>
          </div>
        )}

        {/* 운영시간 */}
        <div className="!mt-5 max-w-[320px]">
          <div className="text-md font-semibold !mb-2 text-left text-foreground">
            운영시간
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-y-1 gap-x-4 text-sm">
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
      </DialogContent>
    </Dialog>
  );
}
