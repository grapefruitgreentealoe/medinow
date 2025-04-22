'use client';

import { useRef, useEffect } from 'react';
import { CareUnit } from '@/features/map/type';

import { Skeleton } from '@/components/ui/skeleton';
import { getTMCoordFromLatLng } from '@/shared/lib/kakao-utils';
import { CareUnitCard } from './CareUnitCard';

import { useSetAtom } from 'jotai';
import {
  selectedCareUnitAtom,
  detailSheetPageAtom,
} from '@/features/map/atoms/detailSheetAtoms';

interface MediListPageProps {
  data: CareUnit[];
  isLoading: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => void;
}

export function MediListPage({
  data,
  isLoading,
  hasNextPage,
  fetchNextPage,
}: MediListPageProps) {
  const observerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const setSelected = useSetAtom(selectedCareUnitAtom);
  const setPage = useSetAtom(detailSheetPageAtom);

  useEffect(() => {
    const root = scrollRef.current;
    const target = observerRef.current;

    if (!root || !target) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      {
        root,
        threshold: 0.2,
      }
    );

    io.observe(target);
    return () => io.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const handleSelect = (unit: CareUnit) => {
    setSelected(unit);
    setPage('detail');
  };

  const handleOpenKakaoMap = async (unit: CareUnit) => {
    const { lng, lat, name, address } = unit;
    const result = await getTMCoordFromLatLng(lng, lat);
    if (!result) {
      alert('카카오 지도 이동에 실패했습니다.');
      return;
    }

    const kakaoUrl = `https://map.kakao.com/?q=${encodeURIComponent(
      name
    )}&urlX=${Math.round(result.x)}&urlY=${Math.round(result.y)}&road_address_name=${address}&urlLevel=2`;

    window.open(kakaoUrl, '_blank');
  };

  return (
    <div className="max-h-screen overflow-y-auto p-4" ref={scrollRef}>
      <h2 className="text-lg font-semibold mb-2">의료기관 목록</h2>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      ) : (
        data?.map((unit: CareUnit) => (
          <CareUnitCard
            key={unit.id}
            unit={unit}
            onSelect={() => handleSelect(unit)}
            onOpenKakaoMap={() => handleOpenKakaoMap(unit)}
          />
        ))
      )}
      <div ref={observerRef} className="h-12" />
    </div>
  );
}
