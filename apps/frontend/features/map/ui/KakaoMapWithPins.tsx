'use client';

import { useEffect, useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CareUnit } from '@/features/map/type';
import { MediListSheet } from './MediListSheet';
import { useCareUnitsQuery } from '../hooks/useCareUnitsQuery';
import { ListIcon } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { chatModalAtom } from '@/features/chat/store/chatModalAtom';

export default function NearbyCareUnitsMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const circleRef = useRef<kakao.maps.Circle | null>(null);
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);

  const setChat = useSetAtom(chatModalAtom);

  const [location, setLocation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    '전체' | '응급실' | '약국' | '병원'
  >('전체');
  const [selectedMarker, setSelectedMarker] = useState<CareUnit | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [level, setLevel] = useState<number>(3);

  const radius = 0.005 * level;
  const roundedLat = lat ? Math.floor(lat * 1000) / 1000 : null;
  const roundedLng = lng ? Math.floor(lng * 1000) / 1000 : null;

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useCareUnitsQuery({
      lat: roundedLat,
      lng: roundedLng,
      level,
      selectedCategory,
    });

  useEffect(() => {
    if (!window.kakao?.maps || !mapRef.current || mapInstance.current) return;

    window.kakao.maps.load(() => {
      const center = new kakao.maps.LatLng(37.5665, 126.978);
      const map = new kakao.maps.Map(mapRef.current!, { center, level });
      mapInstance.current = map;
      map.setMinLevel(3);
      map.setMaxLevel(5);
      kakao.maps.event.addListener(map, 'idle', () => {
        if (idleTimeout.current) clearTimeout(idleTimeout.current);
        idleTimeout.current = setTimeout(() => {
          const c = map.getCenter();
          setLat((prev) =>
            Math.abs((prev ?? 0) - c.getLat()) > 0.0001 ? c.getLat() : prev
          );
          setLng((prev) =>
            Math.abs((prev ?? 0) - c.getLng()) > 0.0001 ? c.getLng() : prev
          );
        }, 300);
      });
    });
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
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
      { enableHighAccuracy: false }
    );
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !data || lat == null || lng == null) return;

    if (circleRef.current) circleRef.current.setMap(null);
    const circle = new kakao.maps.Circle({
      center: new kakao.maps.LatLng(lat, lng),
      radius: radius * 111000,
      strokeWeight: 1,
      strokeColor: '#6366F1',
      strokeOpacity: 0.8,
      fillColor: '#6366F140',
      fillOpacity: 0.3,
    });
    circle.setMap(map);
    circleRef.current = circle;

    markersRef.current.forEach((m) => m.setMap(null));
    const newMarkers: kakao.maps.Marker[] = [];

    data.forEach((unit: CareUnit) => {
      const position = new kakao.maps.LatLng(unit.lat, unit.lng);
      const marker = new kakao.maps.Marker({ map, position });

      kakao.maps.event.addListener(marker, 'click', () => {
        if (overlayRef.current) overlayRef.current.setMap(null);

        const overlayContent = document.createElement('div');
        overlayContent.innerHTML = `
          <div class="marker-popover">
            <strong>${unit.name}</strong><br/>
            <button id="popover-detail-${unit.id}" style="margin-top: 4px; padding: 2px 6px; font-size: 12px;">상세</button>
            <button id="popover-chat-${unit.id}" style="margin-top: 4px; padding: 2px 6px; font-size: 12px;">💬 채팅</button>
          </div>`;

        const overlay = new kakao.maps.CustomOverlay({
          content: overlayContent,
          position,
          yAnchor: 1,
        });

        overlay.setMap(map);
        overlayRef.current = overlay;

        setTimeout(() => {
          const detailBtn = document.getElementById(
            `popover-detail-${unit.id}`
          );
          const chatBtn = document.getElementById(`popover-chat-${unit.id}`);

          if (detailBtn) {
            detailBtn.onclick = () => {
              setSelectedMarker(unit);
              overlay.setMap(null);
            };
          }

          if (chatBtn) {
            chatBtn.onclick = () => {
              setChat({ isOpen: true, target: unit });
              overlay.setMap(null);
            };
          }
        }, 0);
      });

      newMarkers.push(marker);
    });

    markersRef.current = newMarkers;

    const bounds = new kakao.maps.LatLngBounds(
      new kakao.maps.LatLng(lat - radius, lng - radius),
      new kakao.maps.LatLng(lat + radius, lng + radius)
    );
    // 🔒 수동 줌 상태에서는 bounds 설정하지 않음

    map.setBounds(bounds);
  }, [data, lat, lng, level, radius]);

  const handleZoom = (dir: 'in' | 'out') => {
    const map = mapInstance.current;
    if (!map) return;
    const mapLevel = map.getLevel();
    const newLevel = dir === 'in' ? mapLevel - 1 : mapLevel + 1;
    setLevel(newLevel);
    map.setLevel(newLevel);
  };

  const handleSelectFromList = (unit: CareUnit) => {
    const map = mapInstance.current;
    if (!map) return;
    const latlng = new kakao.maps.LatLng(unit.lat, unit.lng);
    map.panTo(latlng);
    setLat(unit.lat);
    setLng(unit.lng);
    setSelectedMarker(unit);
  };

  return (
    <div className="p-4 space-y-2">
      <div className="flex justify-between items-center mb-2">
        <Label>현재 위치: {location ?? '로딩 중...'}</Label>
        <Select
          value={selectedCategory}
          onValueChange={(v: '전체' | '응급실' | '약국' | '병원') => {
            setSelectedCategory(v);
          }}
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
            data={data ?? []}
            isLoading={isLoading}
            isFetching={isFetching}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            onSelect={handleSelectFromList}
          >
            <Button className="w-10 text-xs">
              <ListIcon />
            </Button>
          </MediListSheet>
        </div>
      </div>
    </div>
  );
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
