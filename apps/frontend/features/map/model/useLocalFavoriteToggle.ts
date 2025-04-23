import { useQueryClient } from '@tanstack/react-query';
import { updateCareUnitFavorite } from './updateCareUnitFavorite';
import { useAtomValue } from 'jotai';
import { careUnitsQueryKeyAtom } from '@/features/map/atoms/careUnitsQueryKeyAtom';

export function useLocalFavoriteToggle() {
  const queryClient = useQueryClient();
  const queryKey = useAtomValue(careUnitsQueryKeyAtom);

  return (unitId: string, currentFavorite: boolean) => {
    updateCareUnitFavorite(queryClient, queryKey, unitId, !currentFavorite);
  };
}
