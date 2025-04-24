'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star } from 'lucide-react';
import { useAtomValue, useSetAtom } from 'jotai';
import { ReviewList } from '@/features/review/ui/ReviewList';
import { selectedFavoriteCareUnitAtom } from '../atoms/selectedFavoriteCareUnitAtom';

export function HospitalDetailDrawer() {
  const unit = useAtomValue(selectedFavoriteCareUnitAtom);
  const setSelected = useSetAtom(selectedFavoriteCareUnitAtom);

  if (!unit) return null;

  return (
    <Drawer
      open={!!unit}
      onOpenChange={(open) => {
        if (!open) setSelected(null);
      }}
    >
      <DrawerContent className="p-4 pb-8 max-h-[90dvh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle className="text-xl font-bold">{unit.name}</DrawerTitle>
          <DrawerDescription>{unit.address}</DrawerDescription>
        </DrawerHeader>

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

          <div>
            <span className="text-muted-foreground">상태: </span>
            <Badge
              variant={unit.nowOpen ? 'default' : 'outline'}
              className={
                unit.nowOpen
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-300 text-gray-600'
              }
            >
              {unit.nowOpen ? '운영 중' : '운영 종료'}
            </Badge>
          </div>
        </div>

        <DrawerFooter className="mt-6 flex justify-between">
          <DrawerClose asChild>
            <Button variant="ghost">닫기</Button>
          </DrawerClose>
        </DrawerFooter>
        <ReviewList careUnitId={unit.id} />
      </DrawerContent>
    </Drawer>
  );
}
