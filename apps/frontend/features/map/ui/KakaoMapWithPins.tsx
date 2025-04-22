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

  const setChat = useSetAtom(chatModalAtom);

  const [location, setLocation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    '전체' | '응급실' | '약국' | '병원'
  >('전체');
  const [openFilter, setOpenFilter] = useState<string>('true');
  const [selectedMarker, setSelectedMarker] = useState<CareUnit | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [level, setLevel] = useState<number>(5);
  const [isManualZoom, setIsManualZoom] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const radius = 0.005 * level;
  const roundedLat = lat ? Math.floor(lat * 1000) / 1000 : null;
  const roundedLng = lng ? Math.floor(lng * 1000) / 1000 : null;

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useCareUnitsQuery({
      lat: roundedLat,
      lng: roundedLng,
      level: level,
      selectedCategory,
      OpenStatus: JSON.parse(openFilter) as boolean,
    });

  function drawRadiusCircle(
    map: kakao.maps.Map,
    lat: number,
    lng: number,
    radius: number
  ) {
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
  }

  function createMarkersWithOverlay(map: kakao.maps.Map, data: CareUnit[]) {
    markersRef.current.forEach((m) => m.setMap(null));
    const newMarkers: kakao.maps.Marker[] = [];

    data.forEach((unit) => {
      const position = new kakao.maps.LatLng(unit.lat, unit.lng);
      const marker = new kakao.maps.Marker({ map, position });
      marker.setTitle(unit.name);

      let currentOpenInfoWindow: kakao.maps.InfoWindow | null = null;

      data.forEach((unit) => {
        const position = new kakao.maps.LatLng(unit.lat, unit.lng);
        const marker = new kakao.maps.Marker({
          map,
          position,
          clickable: true,
        });

        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:6px 12px; font-size:14px;">${unit.name}</div>`,
        });

        // PC: 마우스 호버
        kakao.maps.event.addListener(marker, 'mouseover', () => {
          if (currentOpenInfoWindow) currentOpenInfoWindow.close();
          infowindow.open(map, marker);
          currentOpenInfoWindow = infowindow;
        });

        kakao.maps.event.addListener(marker, 'mouseout', () => {
          infowindow.close();
          currentOpenInfoWindow = null;
        });

        // 모바일: 클릭(탭)용 - 토글 동작
        kakao.maps.event.addListener(marker, 'click', () => {
          // PC hover에서 열린 경우 닫기
          if (currentOpenInfoWindow === infowindow) {
            infowindow.close();
            currentOpenInfoWindow = null;
          } else {
            if (currentOpenInfoWindow) currentOpenInfoWindow.close();
            infowindow.open(map, marker);
            currentOpenInfoWindow = infowindow;
          }
        });

        newMarkers.push(marker);
      });

      newMarkers.push(marker);
    });

    markersRef.current = newMarkers;
  }
  function fitMapToBounds(
    map: kakao.maps.Map,
    lat: number,
    lng: number,
    radius: number
  ) {
    const bounds = new kakao.maps.LatLngBounds(
      new kakao.maps.LatLng(lat - radius, lng - radius),
      new kakao.maps.LatLng(lat + radius, lng + radius)
    );
    map.setBounds(bounds);
  }

  useEffect(() => {
    if (!window.kakao?.maps || !mapRef.current || mapInstance.current) return;

    window.kakao.maps.load(() => {
      const center = new kakao.maps.LatLng(37.5665, 126.978);
      const map = new kakao.maps.Map(mapRef.current!, { center, level });
      mapInstance.current = map;
      setIsMapReady(true); // ✅ 맵 준비 완료!

      kakao.maps.event.addListener(map, 'idle', () => {
        const currentLevel = map.getLevel();
        //  사용자 조작으로 줌 레벨이 바뀐 경우 level 갱신
        setLevel((prev) => {
          if (prev !== currentLevel) {
            setIsManualZoom(true); // 사용자가 줌했단 뜻
            return currentLevel;
          }
          return prev;
        });
        // ✅ 중심 좌표도 갱신
        const c = map.getCenter();
        setLat((prev) =>
          Math.abs((prev ?? 0) - c.getLat()) > 0.0001 ? c.getLat() : prev
        );
        setLng((prev) =>
          Math.abs((prev ?? 0) - c.getLng()) > 0.0001 ? c.getLng() : prev
        );
      });
    });
  }, [level]);

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

  // 1. Circle 그리기
  useEffect(() => {
    const map = mapInstance.current;
    if (!isMapReady || !map || lat == null || lng == null) return;
    drawRadiusCircle(map, lat, lng, radius);
  }, [isMapReady, lat, lng, radius, data]);

  // 2. 마커 그리기
  useEffect(() => {
    const map = mapInstance.current;
    if (!isMapReady || !map || !data) return;
    createMarkersWithOverlay(map, data);
  }, [isMapReady, data]);

  // 3. bounds 설정
  useEffect(() => {
    const map = mapInstance.current;
    if (!isMapReady || !map || lat == null || lng == null || isManualZoom)
      return;
    fitMapToBounds(map, lat, lng, radius);
  }, [isMapReady, lat, lng, radius, isManualZoom]);

  const handleZoom = (dir: 'in' | 'out') => {
    const map = mapInstance.current;
    if (!map) return;
    const mapLevel = map.getLevel();
    const newLevel = dir === 'in' ? mapLevel - 1 : mapLevel + 1;

    setIsManualZoom(true);

    map.setLevel(newLevel);
    setLevel(newLevel);
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
        <div className="flex">
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
          <Select
            value={openFilter}
            onValueChange={(v: string) => {
              setOpenFilter(v);
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="운영상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={'false'}>운영중</SelectItem>
              <SelectItem value={'true'}>전체</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
