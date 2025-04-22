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
import { useCareUnitsQuery } from '../model/useCareUnitsQuery';
import { ListIcon } from 'lucide-react';
import { useAtomValue, useSetAtom } from 'jotai';
import { chatModalAtom } from '@/features/chat/atoms/chatModalAtom';
import { getDefaultStore } from 'jotai';
import {
  detailSheetOpenAtom,
  detailSheetPageAtom,
  selectedCareUnitAtom,
} from '@/features/map/atoms/detailSheetAtoms';
import CareUnitSheet from './CareUnitSheet';
import FilterMenu from './FilterMenu';
import { categoryAtom, openStatusAtom } from '../atoms/filterAtom';
import { convertCoordsToDong, getCategoryIconSvg } from '../utils';

const store = getDefaultStore();

export default function NearbyCareUnitsMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const circleRef = useRef<kakao.maps.Circle | null>(null);
  const [initialLocation, setInitialLocation] = useState({
    lat: 37.5468,
    lng: 127.0577,
  });
  const [location, setLocation] = useState<string | null>(null);
  const selectedCategory = useAtomValue(categoryAtom);
  const openFilter = useAtomValue(openStatusAtom);
  const [lat, setLat] = useState<number | null>(37.5468);
  const [lng, setLng] = useState<number | null>(127.0577);
  const [level, setLevel] = useState<number>(5);
  const [isManualZoom, setIsManualZoom] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const radius = 0.005 * level;
  const roundedLat = lat ? Math.floor(lat * 1000) / 1000 : null;
  const roundedLng = lng ? Math.floor(lng * 1000) / 1000 : null;

  const { data } = useCareUnitsQuery({
    lat: roundedLat,
    lng: roundedLng,
    level,
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
  // hvec 기반 색상
  function getDotColor(hvec: number): string {
    if (hvec <= 0) return '#ef4444'; // 혼잡
    if (hvec < 10) return '#f97316'; // 보통
    return '#22c55e'; // 여유
  }
  function createMarkersWithOverlay({
    map,
    data,
  }: {
    map: kakao.maps.Map;
    data: CareUnit[];
  }) {
    if (!map || !data) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    data.forEach((unit, index) => {
      const position = new kakao.maps.LatLng(unit.lat, unit.lng);
      const iconHtml = getCategoryIconSvg(unit.category);
      const overlayId = `custom-overlay-${index}`;
      const hvec = unit.congestion?.hvec ?? -1;

      const hvecDots =
        unit.nowOpen && unit.category === 'emergency'
          ? `<div style="
          position: absolute;
          top: -4px;
          right: -4px;
          display: flex;
          gap: 1px;
        ">
        ${[...Array(Math.min(Math.max(hvec, 0), 5))]
          .map(
            () =>
              `<span style="color: ${getDotColor(hvec)}; font-size: 8px; line-height: 1;">●</span>`
          )
          .join('')}
      </div>`
          : '';

      const backgroundColor = unit.nowOpen ? '#ffffff' : '#d1d5db';

      const overlay = new kakao.maps.CustomOverlay({
        position,
        content: `
    <div id="${overlayId}" style="
      position: relative;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 100%;
      background: ${backgroundColor};
      border: 1px solid #e5e7eb;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      cursor: pointer;
    ">
      ${iconHtml}
      ${hvecDots}
    </div>
  `,
        yAnchor: 1,
      });

      overlay.setMap(map);
      markersRef.current.push(overlay);

      setTimeout(() => {
        const el = document.getElementById(overlayId);
        if (el) {
          el.addEventListener('click', () => {
            store.set(selectedCareUnitAtom, unit);
            store.set(detailSheetOpenAtom, true);
            store.set(detailSheetPageAtom, 'detail');
          });
        }
      }, 0);
    });
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
        // 중심 좌표도 갱신
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
        setInitialLocation(() => {
          return {
            lat: latitude as number,
            lng: longitude as number,
          };
        });
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
    createMarkersWithOverlay({ map, data });
  }, [isMapReady, data]);

  // 3. bounds 설정
  useEffect(() => {
    const map = mapInstance.current;
    if (!isMapReady || !map || lat == null || lng == null || isManualZoom)
      return;
    fitMapToBounds(map, lat, lng, radius);
  }, [isMapReady, lat, lng, radius, isManualZoom]);

  const handleFirstLocationButton = () => {
    const { lat, lng } = initialLocation;
    setLat(lat);
    setLng(lng);
    if (mapInstance.current) {
      const center = new kakao.maps.LatLng(lat, lng);
      mapInstance.current.setCenter(center);
    }
  };

  return (
    <div className="p-4 space-y-2">
      <div className="flex justify-between flex-wrap items-center gap-[10px] !m-2">
        <div className="flex">
          <Label className="text-sm text-muted-foreground">
            현재 위치: {location ?? '엘리스'}
          </Label>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm !px-3"
            onClick={handleFirstLocationButton}
          >
            현재 위치로 돌아가기
          </Button>
        </div>
      </div>
      <div className="relative h-[90vh]">
        <div
          ref={mapRef}
          className="w-full h-full rounded-xl bg-gray-100 z-0"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="w-9 h-9 text-xl bg-white hover:bg-primary rounded-md shadow-sm"
            onClick={() => mapInstance.current?.setLevel(level - 1)}
          >
            +
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-9 h-9 text-xl bg-white hover:bg-primary rounded-md shadow-sm"
            onClick={() => mapInstance.current?.setLevel(level + 1)}
          >
            −
          </Button>
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="w-9 h-9 bg-white rounded-md shadow-sm disabled:[bg-slate-500 text-white]"
              disabled={data.length === 0} // 리스트가 없으면 disabled
              onClick={() => {
                store.set(detailSheetOpenAtom, true);
                store.set(selectedCareUnitAtom, null);
                store.set(detailSheetPageAtom, 'list');
              }}
            >
              <ListIcon size={18} />
            </Button>

            {data.length > 0 && (
              <div className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-medium rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                {data.length}
              </div>
            )}
          </div>

          <FilterMenu />
        </div>
      </div>
      <CareUnitSheet {...{ lat, lng, level, selectedCategory, openFilter }} />
    </div>
  );
}
