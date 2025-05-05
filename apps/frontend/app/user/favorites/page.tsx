'use client';

import { useState } from 'react';
import { useFavoritesQuery } from '@/features/user-favorites/model/useFavoritesQuery';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { unfavoriteConfirmUnitAtom } from '@/features/user-favorites/atoms/unfavoriteConfirmModalAtom';
import { useAtomValue, useSetAtom } from 'jotai';
import { CareUnitCard } from '@/features/user-favorites/ui/FavoriteUnitCard';
import { HospitalDetailDialog } from '@/features/user-favorites/ui/HospitalDetailDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { selectedFavoriteCareUnitAtom } from '@/features/user-favorites/atoms/selectedFavoriteCareUnitAtom';
import { selectedFavoriteCareUnitsQueryKeyAtom } from '@/features/user-favorites/atoms/selectedFavoriteCareUnitAtom';

import { useFavoriteToggle } from '@/features/user-favorites/model/useFavoriteToggle';
import { CareUnit } from '@/shared/type';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { SimplePagination } from '@/shared/ui/SimplePagination';

export default function FavoritePage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useFavoritesQuery(page, 10);
  const selected = useAtomValue(selectedFavoriteCareUnitAtom);
  const setConfirmUnit = useSetAtom(unfavoriteConfirmUnitAtom);
  const setSelected = useSetAtom(selectedFavoriteCareUnitAtom);
  const confirmUnit = useAtomValue(unfavoriteConfirmUnitAtom);
  const { mutate: toggleFavorite } = useFavoriteToggle(page);
  const units = data?.careUnits ?? [];
  const totalPages = data?.totalPages ?? 1;
  const isLastPage = page >= totalPages;

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div className="!space-y-6 !mx-[20px] !mt-[30px]">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {units?.map((unit: CareUnit) => {
          if (!unit) return null;
          return (
            <CareUnitCard
              key={unit.id}
              unit={unit}
              onSelect={() => setSelected(unit)}
              onConfirmUnfavorite={() => setConfirmUnit(unit)}
              currentPage={page}
            />
          );
        })}
      </div>
      <HospitalDetailDialog />
      <SimplePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!confirmUnit}
        onClose={() => setConfirmUnit(null)}
        onConfirm={() => {
          toggleFavorite({ unitId: confirmUnit?.id ?? '' });
          setConfirmUnit(null);
        }}
        title="즐겨찾기 해제"
        description={`정말 ${confirmUnit?.name} 의료기관을 즐겨찾기 해제하시겠어요?`}
        confirmText="해제하기"
        cancelText="취소"
        confirmVariant="destructive"
      />
    </div>
  );
}
