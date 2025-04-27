'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CareUnitCardLayoutProps {
  title: string;
  children: React.ReactNode;
  cta?: React.ReactNode;
  rounded?: boolean;
}

export function CareUnitCardLayout({
  title,
  children,
  cta,
  rounded = true,
}: CareUnitCardLayoutProps) {
  return (
    <Card
      className={cn(
        'mb-4 cursor-pointer hover:shadow-md bg-background transition-shadow rounded-none border-t-0 border-l-0 border-r-0 border-b-[1px] border-b-slate-300 border-solid',
        'min-h-[100px]', // 카드 높이 일정하게
        rounded && 'rounded-2xl'
      )}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '64px' }}
    >
      <CardContent className="!p-5 flex flex-col justify-between h-full space-y-4">
        {/* 타이틀 */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-primary truncate">{title}</h3>
        </div>

        {/* 본문 */}
        <div className="flex-1 flex flex-col gap-2 overflow-hidden">
          {children}
        </div>

        {/* (선택적) CTA */}
        {cta && <div className="pt-2 flex justify-end">{cta}</div>}
      </CardContent>
    </Card>
  );
}
