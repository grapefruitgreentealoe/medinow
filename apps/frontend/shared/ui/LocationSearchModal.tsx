'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LocationSearchModalProps {
  subtitle: string;
  title: string;
  open: boolean;
  onClose: () => void;
  onSelect: (data: {
    name: string;
    address: string;
    lat: string;
    lng: string;
  }) => void;
}

export default function LocationSearchModal({
  title = '',
  subtitle = '',
  open,
  onClose,
  onSelect,
}: LocationSearchModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null); // 👈 map 객체 보관
  const [loaded, setLoaded] = useState(false);
  const setMap = useState<kakao.maps.Map | null>(null)[1];
  const [places, setPlaces] = useState<
    {
      place_name: string;
      road_address_name?: string;
      address_name: string;
      x: string;
      y: string;
    }[]
  >([]);
  const [keyword, setKeyword] = useState('');

  // Dialog 열릴 때마다 새 맵 생성
  useEffect(() => {
    if (!loaded || !open) return;

    const frame = requestAnimationFrame(() => {
      if (!mapRef.current) return;

      window.kakao.maps.load(() => {
        const mapInstance = new window.kakao.maps.Map(mapRef.current!, {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
        });
        setMap(mapInstance);
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [loaded, open, setMap]);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.kakao?.maps?.services) return;

    const ps = new window.kakao.maps.services.Places();

    ps.keywordSearch(
      keyword,
      (
        result: kakao.maps.services.PlacesSearchResult,
        status: kakao.maps.services.Status
      ) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setPlaces(result);
        }
      }
    );
  };

  const handleSelect = (place: {
    place_name: string;
    road_address_name?: string;
    address_name: string;
    x: string;
    y: string;
  }) => {
    onSelect({
      name: place.place_name,
      address: place.road_address_name || place.address_name,
      lat: place.y,
      lng: place.x,
    });
    onClose();
  };

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY}&libraries=services&autoload=false`}
        onLoad={() => setLoaded(true)}
      />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogOverlay className="bg-black/10 backdrop-brightness-80" />
        <DialogContent className="!p-6 !max-w-2xl">
          <DialogHeader className="!mb-2 !gap-1">
            <DialogTitle className="text-lg">{title}</DialogTitle>
            <DialogDescription>{subtitle}</DialogDescription>
          </DialogHeader>

          {/* 검색창 */}
          <form onSubmit={search} className="flex gap-2 !mb-3">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="장소 키워드를 입력하세요"
              className="text-black bg-white"
            />
            <Button type="submit" className="!px-4 !py-2">
              검색
            </Button>
          </form>

          {/* 지도 영역 - 반드시 사이즈 지정 */}
          <div
            ref={mapRef}
            className="w-[100px] h-[100px] absolute -top-[9999px] overflow-hidden opacity-0 pointer-events-none"
          />

          {/* 검색 결과 */}
          <ScrollArea className="h-72 w-full rounded-md border">
            {places.map((place, i) => (
              <li
                key={i}
                className="!p-3 bg-white border-b-[1px] border-b-slate-100 border-solid cursor-pointer hover:bg-muted transition-colors text-sm list-none"
                onClick={() => handleSelect(place)}
              >
                <strong className="text-base">{place.place_name}</strong>
                <br />
                <span className="text-muted-foreground">
                  {place.road_address_name || place.address_name}
                </span>
              </li>
            ))}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
