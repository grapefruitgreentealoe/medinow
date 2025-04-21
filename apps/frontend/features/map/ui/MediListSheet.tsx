'use client';

import { useRef, useEffect, ReactNode, useState } from 'react';
import { CareUnit } from '@/features/map/type';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { getTMCoordFromLatLng } from '@/lib/kakao-utils';
import { CareUnitCard } from './CareUnitCard';

interface MediListSheetProps {
  children: ReactNode;
  data: CareUnit[];
  isLoading: boolean;
  isFetching: boolean;
  hasNextPage: boolean | undefined;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      const root = scrollRef.current;
      const target = observerRef.current;

      if (!root || !target) return;

      const io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage) {
            console.log('🔥 Triggered!');
            fetchNextPage();
          }
        },
        {
          root,
          threshold: 0.2,
        }
      );

      io.observe(target);
    }, 300); // ✅ Sheet transition 끝날 때까지 대기

    return () => clearTimeout(timer);
  }, [open, hasNextPage, fetchNextPage]);

  const handleSelect = (unit: CareUnit) => {
    onSelect(unit); // 기존 onSelect 처리
    setOpen(false); // 시트 닫기
  };

  const handleOpenKakaoMap = async (unit: CareUnit) => {
    //목업
    const lng = 126.753;
    const lat = 37.5052;
    const name = '서울아산이비인후과의원';
    const road_address_name = '서울특별시 강동구 고덕로 353';
    // const { lng, lat,name,road_address_name } = unit;
    const result = await getTMCoordFromLatLng(lng, lat);
    if (!result) {
      alert('카카오 지도 이동에 실패했습니다.');
      return;
    }

    const kakaoUrl = `https://map.kakao.com/?q=${encodeURIComponent(
      name
    )}&urlX=${Math.round(result.x)}&urlY=${Math.round(result.y)}&road_address_name=${road_address_name}&urlLevel=2`;

    window.open(kakaoUrl, '_blank');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild onClick={() => setOpen(true)}>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-[90vw] sm:w-[400px] p-0">
        <SheetHeader>
          <SheetTitle>의료기관 목록</SheetTitle>
          <SheetDescription>채팅, 즐겨찾기 설정을 해보세요</SheetDescription>
        </SheetHeader>
        <div className="max-h-screen overflow-y-auto p-4" ref={scrollRef}>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          ) : (
            // 리스트 렌더링
            data?.map((unit: CareUnit) => (
              <CareUnitCard
                key={unit.id}
                unit={unit}
                onSelect={handleSelect}
                onOpenKakaoMap={handleOpenKakaoMap}
              />
            ))
          )}
          <div ref={observerRef} className="h-12 bg-yellow-300" />
          {/* {isFetching && <Skeleton className="h-12 w-full mt-2" />} */}
        </div>
      </SheetContent>
    </Sheet>
  );
}
