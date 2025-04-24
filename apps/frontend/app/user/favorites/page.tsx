'use client';
import { useFavoritesQuery } from '@/features/user-favorites/model/useFavoritesQuery';
import { useOptimisticToggleFavorite } from '@/features/map/model/useOptimisticToggleFavorite';
import { selectedCareUnitAtom } from '@/features/map/atoms/selectedCareUnitAtom';
import { useAtomValue, useSetAtom } from 'jotai';
import { RichCareUnitCard } from '@/features/user-favorites/ui/FavoriteUnitCard';
import { HospitalDetailDrawer } from '@/features/user-favorites/ui/HospitalDetailDrawer';

export default function FavoritesPage() {
  const selected = useAtomValue(selectedCareUnitAtom);
  const setSelected = useSetAtom(selectedCareUnitAtom);

  const {
    data: pages,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useFavoritesQuery();

  const queryKey = ['favorites'];
  const { mutate: toggleFavorite } = useOptimisticToggleFavorite(queryKey);
  console.log(pages);
  const data = pages ?? [];

  return (
    <section className="h-[100vh] overflow-y-auto">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">즐겨찾기 병원</h1>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {data?.map((unit) => (
            <RichCareUnitCard
              key={unit.id}
              unit={unit}
              onDetail={() => setSelected(unit)}
              onToggleFavorite={() => toggleFavorite({ unitId: unit.id })}
            />
          ))}
        </div>
      </div>

      {selected && (
        <HospitalDetailDrawer
          onToggleFavorite={() => toggleFavorite({ unitId: selected.id })}
        />
      )}
    </section>
  );
}
