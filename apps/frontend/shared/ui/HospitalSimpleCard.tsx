'use client';

import { CareUnit } from '@/shared/type';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HospitalTimeTable } from '@/shared/ui/HospitalTimeTable';
import { ReviewList } from '@/features/review/ui/ReviewList';
import {
  Star,
  StarOff,
  MessageSquare,
  PhoneCallIcon,
  PencilIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/constants/routes';
import { renderTodayTime } from '@/features/map/utils';

interface HospitalSimpleCardProps {
  unit: CareUnit;
}

export function HospitalSimpleCard({ unit }: HospitalSimpleCardProps) {
  const router = useRouter();

  const handleChat = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 의료기관 채팅 연결 로직 (필요 시 추가)
    e.stopPropagation();
    router.push(ROUTES.USER.CHAT(unit.id));
  };

  const categoryLabel =
    unit.category === 'emergency'
      ? '응급실'
      : unit.category === 'pharmacy'
        ? '약국'
        : '병원';

  return (
    <Card className="!p-6 bg-background text-foreground text-sm leading-relaxed rounded-none border-r-none overflow-y-auto">
      {/* 의료기관명 + 버튼들 */}
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

        <div className="flex items-center gap-1">
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
            onClick={() =>
              router.push(ROUTES.USER.WRITE_REVIEW + `?careUnitId=${unit.id}`)
            }
            className="w-8 h-8"
          >
            <PencilIcon className="text-blue-500" size={18} />
          </Button>
          {unit.tel && (
            <a href={`tel:${unit.tel}`}>
              <Button size="icon" variant="ghost" className="w-8 h-8">
                <PhoneCallIcon className="text-slate-500" size={18} />
              </Button>
            </a>
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

        <div className="text-muted-foreground !mt-1">오늘 운영시간</div>
        <div className="!mt-1 text-muted-foreground">
          <span className="text-foreground font-medium">
            {renderTodayTime(unit)}
          </span>
          <span className="inline-block !px-2" />
          <Badge className="text-muted-foreground bg-muted border">
            {unit.nowOpen ? '운영 중' : '운영 종료'}
          </Badge>
        </div>
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
            {unit.congestion.congestionLevel} (병상 수: {unit.congestion.hvec})
          </div>
        </div>
      )}

      {/* 아코디언 */}
      <Accordion className="!mt-6 !space-y-4" type="single" collapsible>
        {/* 진료 과목 */}
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
            전체 운영시간
          </AccordionTrigger>
          <AccordionContent className="!my-3">
            <HospitalTimeTable unit={unit} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {/* 방문자 리뷰 */}
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
    </Card>
  );
}
