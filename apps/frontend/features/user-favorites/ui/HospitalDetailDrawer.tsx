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
import { selectedCareUnitAtom } from '@/features/map/atoms/selectedCareUnitAtom';

export function HospitalDetailDrawer() {
  const unit = useAtomValue(selectedCareUnitAtom);
  const setSelected = useSetAtom(selectedCareUnitAtom);

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
              {(unit.rating ?? 0).toFixed(1)} ({unit.reviewCount ?? 0}건)
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {unit.departments?.map((s) => (
              <Badge key={s} variant="outline">
                {s}
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

        <DrawerFooter className="mt-6">
          <Button variant="outline" asChild>
            <a
              href={`https://map.kakao.com/?q=${unit.name}&road_address_name=${unit.address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              길찾기 열기
            </a>
          </Button>
          <DrawerClose asChild>
            <Button variant="ghost">닫기</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
