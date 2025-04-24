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

export default function FavoritePage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useFavoritesQuery(page, 10);
  const selected = useAtomValue(selectedFavoriteCareUnitAtom);
  const setConfirmUnit = useSetAtom(unfavoriteConfirmUnitAtom);
  const setSelected = useSetAtom(selectedFavoriteCareUnitAtom);
  const confirmUnit = useAtomValue(unfavoriteConfirmUnitAtom);
  const { mutate: toggleFavorite } = useFavoriteToggle(page);

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div className="!space-y-6 !mx-[20px] !mt-[30px]">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data?.map((unit: CareUnit) => {
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
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext onClick={() => setPage((p) => p + 1)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <Dialog open={!!confirmUnit} onOpenChange={() => setConfirmUnit(null)}>
        <DialogContent>
          <DialogHeader>
            <p className="text-lg font-semibold">즐겨찾기 해제</p>
          </DialogHeader>
          <p className="text-sm mt-2">
            정말 <strong>{confirmUnit?.name}</strong> 병원을 즐겨찾기
            해제하시겠어요?
          </p>

          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button
              variant="destructive"
              onClick={() => {
                toggleFavorite({ unitId: confirmUnit?.id ?? '' });
                setConfirmUnit(null);
              }}
            >
              해제하기
            </Button>
            <Button variant="outline" onClick={() => setConfirmUnit(null)}>
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
