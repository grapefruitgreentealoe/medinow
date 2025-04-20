'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { locationByCategory, locationByCategoryMock } from '../api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CareUnit } from '@/features/type';

export default function NearbyCareUnitsMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);

  const [location, setLocation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    '전체' | '응급실' | '약국' | '병원'
  >('전체');
  const [selectedMarker, setSelectedMarker] = useState<CareUnit | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [level, setLevel] = useState<number>(1);
  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useInfiniteQuery({
      queryKey: ['careUnits', lat, lng, selectedCategory],
      queryFn: async ({ pageParam = 1 }) => {
        const items = await locationByCategory({
          // const items = await locationByCategoryMock({
          lat: lat!,
          lng: lng!,
          level,
          page: pageParam,
          limit: 10,
          category:
            selectedCategory === '응급실'
              ? 'emergency'
              : selectedCategory === '병원'
                ? 'hospital'
                : selectedCategory === '약국'
                  ? 'pharmacy'
                  : undefined,
        });

        return {
          items,
          hasNext: items.length === 10, // 한 페이지가 다 찼으면 다음 페이지 있다고 판단
          nextPage: undefined,
        };
      },
      getNextPageParam: () => undefined,
      initialPageParam: 1,
      enabled: lat !== null && lng !== null,
    });

  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log(latitude, longitude);
        setLat(latitude);
        setLng(longitude);
        convertCoordsToDong(latitude, longitude).then((dong) =>
          setLocation(dong)
        );
      },
      (err) => {
        console.error('❌ 위치 에러:', err);
        alert('위치 접근을 허용하지 않으셨습니다.');
      },
      {
        enableHighAccuracy: false, // ~84ms
      }
    );
  }, []);
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    if (observerRef.current) io.observe(observerRef.current);
    return () => io.disconnect();
  }, [hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.kakao?.maps) return;

    window.kakao.maps.load(() => {
      if (!mapRef.current) return;

      const center = new kakao.maps.LatLng(lat ?? 32, lng ?? 127);
      const map = new kakao.maps.Map(mapRef.current, { center, level });
      mapInstance.current = map;

      kakao.maps.event.addListener(map, 'idle', () => {
        const c = map.getCenter();
        setLat(c.getLat());
        setLng(c.getLng());
      });
    });
  }, [lat, lng, level]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !data) return;

    markersRef.current.forEach((m) => m.setMap(null));
    const newMarkers: kakao.maps.Marker[] = [];

    // 모든 페이지의 CareUnit을 평탄화(flatten)
    const allUnits = data.pages.flatMap((page) => page.items);

    allUnits.forEach((unit) => {
      const position = new kakao.maps.LatLng(unit.lat, unit.lng);
      const imageSrc = '/pin-png.png';
      const markerImage = new kakao.maps.MarkerImage(
        imageSrc,
        new kakao.maps.Size(20, 20)
      );

      const marker = new kakao.maps.Marker({
        map,
        position,
        image: markerImage,
      });

      kakao.maps.event.addListener(marker, 'click', () =>
        setSelectedMarker(unit)
      );
      newMarkers.push(marker);
    });

    markersRef.current = newMarkers;
  }, [data, lat, lng]);

  const handleZoom = (dir: 'in' | 'out') => {
    const map = mapInstance.current;
    if (!map) return;
    const mapLevel = map.getLevel();
    map.setLevel(dir === 'in' ? level - 1 : level + 1);
    setLevel(mapLevel);
  };

  const handleSelectFromList = (unit: CareUnit) => {
    const map = mapInstance.current;
    if (!map) return;
    const latlng = new kakao.maps.LatLng(unit.lat, unit.lng);
    map.panTo(latlng);
    setSelectedMarker(unit);
  };

  return (
    <div className="p-4 space-y-2">
      <div className="flex justify-between items-center mb-2">
        <Label>현재 위치: {location ?? '로딩 중...'}</Label>
        <Select
          value={selectedCategory}
          onValueChange={(v: '전체' | '응급실' | '약국' | '병원') =>
            setSelectedCategory(v)
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="종류 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="전체">전체</SelectItem>
            <SelectItem value="응급실">응급실</SelectItem>
            <SelectItem value="약국">약국</SelectItem>
            <SelectItem value="병원">병원</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="z-100">
        <div ref={mapRef} className="w-full h-[400px] rounded-xl bg-gray-100" />
        <div className="absolute top-4 right-4 flex flex-col gap-1">
          <Button onClick={() => handleZoom('in')}>+</Button>
          <Button onClick={() => handleZoom('out')}>−</Button>
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto rounded-xl border p-2">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
        ) : (
          data?.pages
            .flatMap((p) => {
              console.log(p);
              return p.items;
            })
            .map((unit) => {
              console.log(unit);
              return (
                <Card
                  key={unit.id}
                  onClick={() => handleSelectFromList(unit)}
                  className="mb-2 cursor-pointer hover:bg-gray-50"
                >
                  <CardContent className="p-3 space-y-1">
                    <h3 className="text-base font-semibold">{unit.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {unit.address}
                    </p>
                    <div className="text-xs flex justify-between">
                      <span>📞 {unit.tel}</span>
                      <span>{unit.isFavorite ? '⭐ 즐겨찾기' : ''}</span>
                      <span>
                        {unit.isChatAvailable ? '💬 채팅 가능' : '❌ 채팅 불가'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
        )}
        <div ref={observerRef} className="h-6" />
        {isFetching && <Skeleton className="h-12 w-full mt-2" />}
      </div>

      <Dialog
        open={!!selectedMarker}
        onOpenChange={() => setSelectedMarker(null)}
      >
        <DialogContent className="max-w-md">
          {selectedMarker && (
            <Card>
              <CardContent className="space-y-1 p-4">
                <h2 className="text-lg font-bold">{selectedMarker.name}</h2>
                <p>{selectedMarker.address}</p>
                <p>{selectedMarker.tel}</p>
                {selectedMarker.category === 'emergency' && (
                  <p className="text-sm text-destructive">
                    가용 병상: {selectedMarker.congestion.hvec ?? '정보 없음'}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getEmergencyMarkerColor(beds?: number): string {
  if (beds == null || beds < 0) return 'black';
  if (beds === 0) return 'red';
  if (beds <= 5) return 'yellow';
  return 'green';
}

async function convertCoordsToDong(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lng}&y=${lat}`,
    {
      headers: {
        Authorization: `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}`,
      },
    }
  );
  const data = await res.json();
  const dong = data.documents?.[0]?.region_3depth_name;
  return dong ?? '알 수 없음';
}
