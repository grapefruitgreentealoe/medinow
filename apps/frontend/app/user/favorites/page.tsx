'use client';
import { useFavoritesQuery } from '@/features/user-favorites/model/useFavoritesQuery';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { HospitalDetailDrawer } from '@/features/user-favorites/ui/HospitalDetailDrawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { selectedFavoriteCareUnitAtom } from '@/features/user-favorites/atoms/selectedFavoriteCareUnitAtom';
import { selectedFavoriteCareUnitsQueryKeyAtom } from '@/features/user-favorites/atoms/selectedFavoriteCareUnitAtom';
import { CareUnitCard } from '@/features/user-favorites/ui/FavoriteUnitCard';
import { useFavoriteToggle } from '@/features/user-favorites/model/useFavoriteToggle';
import { unfavoriteConfirmUnitAtom } from '@/features/user-favorites/atoms/unfavoriteConfirmModalAtom';

export default function FavoritesPage() {
  const selected = useAtomValue(selectedFavoriteCareUnitAtom);
  const setSelected = useSetAtom(selectedFavoriteCareUnitAtom);
  const [confirmUnit, setConfirmUnit] = useAtom(unfavoriteConfirmUnitAtom);

  const {
    data: pages,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useFavoritesQuery();

  const { mutate: toggleFavorite } = useFavoriteToggle();

  return (
    <section className="h-[100vh] overflow-y-auto">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">즐겨찾기 병원</h1>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {pages?.map((unit) => {
            console.log(unit);
            if (!unit) return null;
            return (
              <CareUnitCard
                key={unit.id}
                unit={unit}
                onSelect={() => setSelected(unit)}
                onConfirmUnfavorite={() => setConfirmUnit(unit)}
              />
            );
          })}
        </div>
      </div>

      {selected && <HospitalDetailDrawer />}

      <Dialog open={!!confirmUnit} onOpenChange={() => setConfirmUnit(null)}>
        <DialogContent>
          <DialogHeader>즐겨찾기 해제</DialogHeader>
          <p className="text-sm">
            정말 <strong>{confirmUnit?.name}</strong> 병원을 즐겨찾기
            해제하시겠어요?
          </p>

          <DialogFooter className="mt-4">
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmUnit) {
                  toggleFavorite({ unitId: confirmUnit.id });
                  setConfirmUnit(null);
                }
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
    </section>
  );
}
