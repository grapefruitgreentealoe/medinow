'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star } from 'lucide-react';
import { useAtomValue, useSetAtom } from 'jotai';
import { ReviewList } from '@/features/review/ui/ReviewList';
import { selectedFavoriteCareUnitAtom } from '../atoms/selectedFavoriteCareUnitAtom';
import { cn } from '@/lib/utils';

export function HospitalDetailDialog() {
  const unit = useAtomValue(selectedFavoriteCareUnitAtom);
  const setSelected = useSetAtom(selectedFavoriteCareUnitAtom);

  if (!unit) return null;

  return (
    <Dialog
      open={!!unit}
      onOpenChange={(open) => {
        if (!open) setSelected(null);
      }}
    >
      <DialogOverlay className="bg-black/10 backdrop-brightness-75" />

      <DialogContent className="!max-w-3xl !p-[40px]">
        <DialogHeader className="mb-2 gap-1">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {unit.name}
            <Badge
              variant={unit.nowOpen ? 'default' : 'outline'}
              className={cn(
                unit.nowOpen
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-300 text-gray-600',
                '!p-1 rounded-2xl'
              )}
            >
              {unit.nowOpen ? '운영 중' : '운영 종료'}
            </Badge>
          </DialogTitle>
          <DialogDescription>{unit.address}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>{unit.address}</span>
          </div>

          <div className="flex items-center gap-2">
            <Star className="text-yellow-500 fill-yellow-500" size={16} />
            <span>
              {(unit.averageRating ?? 0).toFixed(1)} ({unit.reviewCount ?? 0}건)
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {unit.departments?.map((s, i) => (
              <Badge key={i} variant="outline">
                {s.name}
              </Badge>
            ))}
          </div>
        </div>

        <ReviewList careUnitId={unit.id} />
      </DialogContent>
    </Dialog>
  );
}
