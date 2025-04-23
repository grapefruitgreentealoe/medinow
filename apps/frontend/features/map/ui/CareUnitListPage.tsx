'use client';

import { useRef, useEffect } from 'react';
import { CareUnit } from '@/features/map/type';

import { Skeleton } from '@/components/ui/skeleton';
import { CareUnitCard } from './CareUnitCard';

import { useSetAtom } from 'jotai';
import { detailSheetPageAtom } from '@/features/map/atoms/detailSheetAtoms';
import { selectedCareUnitAtom } from '../atoms/selectedCareUnitAtom';

interface CareUnitListPageProps {
  data: CareUnit[];
  isLoading: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => void;
}

export function CareUnitListPage({
  data,
  isLoading,
  hasNextPage,
  fetchNextPage,
}: CareUnitListPageProps) {
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

  return (
    <div className="max-h-screen overflow-y-auto p-4" ref={scrollRef}>
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
          />
        ))
      )}
      <div ref={observerRef} className="h-12" />
    </div>
  );
}
