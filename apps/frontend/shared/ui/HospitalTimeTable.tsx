'use client';

import { CareUnit } from '@/shared/type';
import { useRenderTimeRow } from '@/shared/model/useRenderTimeRow';

interface HospitalTimeTableProps {
  unit: CareUnit;
}

export function HospitalTimeTable({ unit }: HospitalTimeTableProps) {
  return (
    <div className="mt-2 grid grid-cols-[80px_1fr] gap-y-1 gap-x-4 text-sm max-w-[280px]">
      {useRenderTimeRow('월요일', unit.mondayOpen, unit.mondayClose)}
      {useRenderTimeRow('화요일', unit.tuesdayOpen, unit.tuesdayClose)}
      {useRenderTimeRow('수요일', unit.wednesdayOpen, unit.wednesdayClose)}
      {useRenderTimeRow('목요일', unit.thursdayOpen, unit.thursdayClose)}
      {useRenderTimeRow('금요일', unit.fridayOpen, unit.fridayClose)}
      {useRenderTimeRow('토요일', unit.saturdayOpen, unit.saturdayClose)}
      {useRenderTimeRow('일요일', unit.sundayOpen, unit.sundayClose)}
      {useRenderTimeRow('공휴일', unit.holidayOpen, unit.holidayClose)}
    </div>
  );
}
