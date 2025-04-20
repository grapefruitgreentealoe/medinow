'use client';

import { useRef, useEffect, ReactNode, useState } from 'react';
import { CareUnit } from '@/features/type';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';

interface MediListSheetProps {
  children: ReactNode;
  data: any;
  isLoading: boolean;
  isFetching: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  onSelect: (unit: CareUnit) => void;
}

export function MediListSheet({
  children,
  data,
  isLoading,
  isFetching,
  hasNextPage,
  fetchNextPage,
  onSelect,
}: MediListSheetProps) {
  const observerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    if (observerRef.current) io.observe(observerRef.current);
    return () => io.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const handleSelect = (unit: CareUnit) => {
    onSelect(unit); // 기존 onSelect 처리
    setOpen(false); // 시트 닫기
  };
  return (
    <Sheet>
      <SheetTrigger asChild onClick={() => setOpen(true)}>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-[90vw] sm:w-[400px] p-0">
        <SheetHeader>
          <SheetTitle>의료기관 목록</SheetTitle>
          <SheetDescription>채팅, 즐겨찾기 설정을 해보세요</SheetDescription>
        </SheetHeader>
        <div className="max-h-screen overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          ) : (
            data?.pages
              .flatMap((p: any) => p.items)
              .map((unit: CareUnit) => (
                <Card
                  key={unit.id}
                  onClick={() => handleSelect(unit)}
                  className="mb-2 cursor-pointer hover:bg-gray-50"
                >
                  <CardContent className="p-3 space-y-1">
                    <h3 className="text-base font-semibold">{unit.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {unit.address}
                    </p>
                    <div className="text-xs flex justify-between">
                      <span>📞 {unit.tel}</span>
                      <span>{unit.isFavorite ? '⭐ 즐겨찾기' : ''}</span>
                      <span>
                        {unit.isChatAvailable ? '💬 채팅 가능' : '❌ 채팅 불가'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
          <div ref={observerRef} className="h-6" />
          {isFetching && <Skeleton className="h-12 w-full mt-2" />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
