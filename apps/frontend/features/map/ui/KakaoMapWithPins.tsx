'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

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
import { MediListSheet } from './MediListSheet';

export default function NearbyCareUnitsMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null);

  const [location, setLocation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    '전체' | '응급실' | '약국' | '병원'
  >('전체');
  const [selectedMarker, setSelectedMarker] = useState<CareUnit | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [level, setLevel] = useState<number>(1);

  /**과도한 패칭 방지 */
  const roundedLat = lat ? Math.floor(lat * 1000) / 1000 : null;
  const roundedLng = lng ? Math.floor(lng * 1000) / 1000 : null;

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useInfiniteQuery({
      staleTime: 5000,
      queryKey: ['careUnits', roundedLat, roundedLng, selectedCategory],
      queryFn: async ({ pageParam = 1 }) => {
        // const items = await locationByCategory({
        const items = await locationByCategoryMock({
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
      getNextPageParam: (lastPage, pages) => {
        return lastPage.hasNext ? pages.length + 1 : undefined;
      },
      initialPageParam: 1,
      enabled: lat !== null && lng !== null,
    });

  const observerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const checkAndFetch = () => {
      if (
        observerRef.current &&
        observerRef.current.getBoundingClientRect().top < window.innerHeight &&
        hasNextPage
      ) {
        fetchNextPage();
      }
    };

    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    if (observerRef.current) {
      io.observe(observerRef.current);
    }

    // ✅ 최초 렌더링 직후 강제로 한번 호출
    setTimeout(checkAndFetch, 100);

    return () => io.disconnect();
  }, [hasNextPage, fetchNextPage]);

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
  // useEffect(() => {
  //   const io = new IntersectionObserver((entries) => {
  //     if (entries[0].isIntersecting && hasNextPage) {
  //       console.log('📌 observe 트리거됨');
  //       fetchNextPage();
  //     }
  //   });

  //   if (observerRef.current) io.observe(observerRef.current);
  //   return () => io.disconnect();
  // }, [hasNextPage, fetchNextPage]);

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

      kakao.maps.event.addListener(marker, 'click', () => {
        // 이전 오버레이 제거
        if (overlayRef.current) {
          overlayRef.current.setMap(null);
        }

        // 오버레이 content 생성 (HTML string)
        const overlayContent = document.createElement('div');
        overlayContent.innerHTML = `
    <div class="marker-popover">
      <strong>${unit.name}</strong><br/>
      <button id="popover-${unit.id}" style="margin-top: 4px; padding: 2px 6px; font-size: 12px;">상세</button>
    </div>
  `;

        const overlay = new kakao.maps.CustomOverlay({
          content: overlayContent,
          position: position,
          yAnchor: 1,
        });

        overlay.setMap(map);
        overlayRef.current = overlay;

        // 팝오버 안에 있는 버튼 이벤트 연결 (이때 DOM이 삽입된 후여야 함)
        setTimeout(() => {
          const btn = document.getElementById(`popover-${unit.id}`);
          if (btn) {
            btn.onclick = () => {
              setSelectedMarker(unit);
              overlay.setMap(null); // 팝오버 닫기
            };
          }
        }, 0);
      });

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
      <div className="h-[20px]" />
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-[90vh] rounded-xl bg-gray-100 z-0"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-1">
          <Button
            className="w-10 text-2xl cursor-pointer"
            onClick={() => handleZoom('in')}
          >
            +
          </Button>
          <Button className="w-10 text-2xl" onClick={() => handleZoom('out')}>
            −
          </Button>
          <MediListSheet
            data={data}
            isLoading={isLoading}
            isFetching={isFetching}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            onSelect={handleSelectFromList}
          >
            <Button className="w-10 text-xs">목록</Button>
          </MediListSheet>
        </div>
      </div>
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
