'use client';

import { useAtom, useAtomValue } from 'jotai';
import { chatModalAtom } from '@/features/chat/atoms/chatModalAtom';
import { useSetAtom } from 'jotai';
import { cn } from '@/lib/utils';
import {
  Star,
  StarOff,
  MessageSquare,
  PhoneCallIcon,
  PencilIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOptimisticToggleFavorite } from '../model/useOptimisticToggleFavorite';
import { careUnitsQueryKeyAtom } from '../atoms/careUnitsQueryKeyAtom';
import { selectedCareUnitAtom } from '../atoms/selectedCareUnitAtom';
import { ReviewList } from '@/features/review/ui/ReviewList';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/constants/routes';

export default function CareUnitDetailPage() {
  const router = useRouter();
  const [unit] = useAtom(selectedCareUnitAtom);
  const setChat = useSetAtom(chatModalAtom);
  const queryKey = useAtomValue(careUnitsQueryKeyAtom);
  const { mutate: toggleFavorite } = useOptimisticToggleFavorite(queryKey);

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

  const handleFavorite = () => {
    toggleFavorite({ unitId: unit.id });
  };

  const handleChat = () => {
    setChat({ isOpen: true, target: unit });
  };

  const categoryLabel =
    unit.category === 'emergency'
      ? '응급실'
      : unit.category === 'pharmacy'
        ? '약국'
        : '병원';

  return (
    <div className="!p-6 !pt-7 !pb-8 space-y-6 bg-background text-foreground text-sm leading-relaxed">
      {/* 병원명, 뱃지, 즐겨찾기, 채팅 */}
      <div className="flex justify-between items-start gap-x-3 gap-y-3">
        <div className="flex flex-col items-start justify-start gap-2">
          <div className="text-lg font-bold text-primary w-full">
            {unit.name}
          </div>

          <div className="flex justify-start">
            <span className="bg-muted text-muted-foreground text-xs !px-2 !py-0.5 rounded-full">
              {categoryLabel}
            </span>
            {unit.isBadged && (
              <span className="bg-yellow-100 text-yellow-700 text-xs !px-2 !py-0.5 rounded-full">
                감사병원
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={handleFavorite}
          >
            {unit.isFavorite ? (
              <Star className="text-yellow-500 fill-yellow-500" size={18} />
            ) : (
              <StarOff size={18} />
            )}
          </Button>
          {unit.isChatAvailable && (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={handleChat}
            >
              <MessageSquare className="text-blue-500" size={18} />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              router.push(ROUTES.USER.WRITE_REVIEW + `?careUnitId=${unit.id}`);
            }}
            className="w-8 h-8"
          >
            <PencilIcon className="text-blue-500" size={18} />
          </Button>
          {unit.tel && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8"
            >
              <a href={`tel:${unit.tel}`}>
                <PhoneCallIcon className="text-slate-500" size={18} />
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="h-[1rem]" />

      {/* 기본 정보 */}
      <div className="grid grid-cols-[80px_1fr] gap-y-1 gap-x-4 text-sm">
        <div className="text-muted-foreground">주소</div>
        <div>{unit.address}</div>

        <div className="text-muted-foreground">전화</div>
        <div>
          <a href={`tel:${unit.tel}`} className="text-blue-600 underline">
            {unit.tel}
          </a>
        </div>

        <div className="text-muted-foreground">운영</div>
        <div>{unit.nowOpen ? '🟢 운영 중' : '🔴 운영 종료'}</div>
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

      {/* 운영시간 */}
      <div className="!mt-5 max-w-[280px]">
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
      <ReviewList careUnitId={unit.id} />
    </div>
  );
}
