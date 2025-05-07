'use client';

import { useAtom, useAtomValue } from 'jotai';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { useOptimisticToggleFavorite } from '../model/useOptimisticToggleFavorite';
import { careUnitsQueryKeyAtom } from '../atoms/careUnitsQueryKeyAtom';
import { selectedCareUnitAtom } from '../atoms/selectedCareUnitAtom';
import { ReviewList } from '@/features/review/ui/ReviewList';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { renderTodayTime } from '../utils';
import { HospitalTimeTable } from '@/shared/ui/HospitalTimeTable';
import { CareUnitMoreMenu } from '@/shared/ui/CareUnitMoreMenu';
export default function CareUnitDetailPage() {
  const router = useRouter();
  const [unit] = useAtom(selectedCareUnitAtom);
  const queryKey = useAtomValue(careUnitsQueryKeyAtom);
  const { mutate: toggleFavorite } = useOptimisticToggleFavorite(queryKey);

  if (!unit) return null;

  const handleFavorite = () => {
    toggleFavorite({ unitId: unit.id });
  };
  const categoryLabel =
    unit.category === 'emergency'
      ? '응급실'
      : unit.category === 'pharmacy'
        ? '약국'
        : '병원';

  return (
    <div className="!p-6 !pt-7 !pb-8 space-y-6 bg-background text-foreground text-sm leading-relaxed">
      {/* 의료기관명, 뱃지, 즐겨찾기, 채팅 */}
      <div className="flex justify-between items-start gap-x-3 gap-y-3">
        <div className="flex flex-col items-start justify-start gap-2">
          <div className="text-lg font-bold text-primary w-full">
            {unit.name}
          </div>

          <div className="flex justify-start">
            <Badge className="bg-muted text-muted-foreground text-xs">
              {categoryLabel}
            </Badge>
            {unit.isBadged && (
              <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                감사기관
              </Badge>
            )}
          </div>
        </div>
        <CareUnitMoreMenu unit={unit} onClickFavorite={handleFavorite} />
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

        <div className="text-muted-foreground !mt-1">오늘 운영시간</div>
        <div className=" !mt-1 text-muted-foreground">
          <span className="text-foreground font-medium">
            {renderTodayTime(unit)}
          </span>
          <span className="inline-block !px-2"></span>
          <Badge className={'text-muted-foreground bg-muted border'}>
            {unit.nowOpen ? '운영 중' : '운영 종료'}
          </Badge>
        </div>
      </div>
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
            {unit.congestion.congestionLevel} (병상 수: {unit.congestion.hvec})
          </div>
        </div>
      )}

      <Accordion className="!mt-6 !space-y-4" type="single" collapsible>
        {/* 진료과목 */}
        {unit.departments?.length > 0 && (
          <AccordionItem value="departments">
            <AccordionTrigger className="cursor-pointer">
              진료 과목
            </AccordionTrigger>
            <AccordionContent className="!my-3">
              <div className="flex flex-wrap gap-2 mt-2">
                {unit.departments.map((dept, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {dept?.name ?? dept}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
        {/* 운영시간 */}
        <AccordionItem value="operation-hours">
          <AccordionTrigger className="cursor-pointer">
            운영 시간
          </AccordionTrigger>
          <AccordionContent className="!my-3">
            <HospitalTimeTable unit={unit} />
          </AccordionContent>
        </AccordionItem>
        {/* 리뷰 */}
      </Accordion>

      <Separator />
      <div className="flex items-center gap-2 !pt-6">
        <span>방문자 리뷰</span>

        <div className="flex items-center text-sm mt-2">
          <Star size={16} className="text-yellow-400 fill-yellow-400" />
          <span className="font-medium text-muted-foreground">
            {(unit.averageRating ?? 0).toFixed(1)}
          </span>
          <span className="text-muted-foreground">
            ({unit.reviewCount ?? 0}건)
          </span>
        </div>
      </div>
      <ScrollArea className="h-[50vh] w-auto rounded-md border-none !py-3">
        <ReviewList careUnitId={unit.id} />
        <div className="h-[200px]" />
      </ScrollArea>
    </div>
  );
}
