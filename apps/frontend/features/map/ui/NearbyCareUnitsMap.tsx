'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useCareUnitsQuery } from '../model/useCareUnitsQuery';
import { useAtomValue, useSetAtom, getDefaultStore } from 'jotai';
import {
  detailSheetOpenAtom,
  detailSheetPageAtom,
} from '@/features/map/atoms/detailSheetAtoms';
import { categoryAtom, openStatusAtom } from '../atoms/filterAtom';
import { convertCoordsToDong, getCategoryIconSvg } from '../utils';
import { useDebounce } from '@/shared/model/useDebounce';
import { selectedCareUnitAtom } from '../atoms/selectedCareUnitAtom';
import CareUnitSheet from './CareUnitSheet';
import FilterMenu from './FilterMenu';
import { ListIcon } from 'lucide-react';
import LocationSearchModal from '@/shared/ui/LocationSearchModal';
import { CareUnit, CongestionLevel } from '../../../shared/type';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCareUnitById } from '@/shared/api';
import { congestionClassMap } from '@/shared/constants/const';
import { ROUTES } from '@/shared/constants/routes';

const store = getDefaultStore();

export default function NearbyCareUnitsMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const router = useRouter();
  const [initialLocation, setInitialLocation] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: 0,
    lng: 0,
  });
  const [location, setLocation] = useState<string | null>(null);
  const selectedCategory = useAtomValue(categoryAtom);
  const openFilter = useAtomValue(openStatusAtom);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [isManualZoom, setIsManualZoom] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [showSearchFallback, setShowSearchFallback] = useState(false); //
  const [hospitalSearchModal, setHospitalSearchModal] = useState(false);
  const radius = 0.005 * (level ?? 0);
  const roundedLat = lat ? Math.floor(lat * 1000) / 1000 : null;
  const roundedLng = lng ? Math.floor(lng * 1000) / 1000 : null;
  const debouncedLevel = useDebounce(level, 300);
  const debouncedLat = useDebounce(roundedLat, 300);
  const debouncedLng = useDebounce(roundedLng, 300);

  const searchParams = useSearchParams();
  const careUnitId = searchParams.get('careUnitId');

  const setSelectedCareUnit = useSetAtom(selectedCareUnitAtom);
  const setSheetOpen = useSetAtom(detailSheetOpenAtom);
  const setSheetPage = useSetAtom(detailSheetPageAtom);
  const isFetchedRef = useRef(false);

  useEffect(() => {
    if (!careUnitId || isFetchedRef.current) return;

    (async () => {
      try {
        const unit = await getCareUnitById(careUnitId);

        setLat(unit.lat);
        setLng(unit.lng);
        setInitialLocation({ lat: unit.lat, lng: unit.lng });
        setLevel(1);
        setIsManualZoom(false);

        mapInstance.current?.setLevel(1);
        mapInstance.current?.setCenter(
          new kakao.maps.LatLng(unit.lat, unit.lng)
        );

        setSelectedCareUnit(unit);
        setSheetOpen(true);
        setSheetPage('detail');

        isFetchedRef.current = true;
      } catch (e) {
        console.error('careUnitId 의료기관 정보 가져오기 실패', e);
      }
    })();
  }, [careUnitId]);

  const { data = [] } = useCareUnitsQuery({
    lat: debouncedLat,
    lng: debouncedLng,
    level: debouncedLevel,
    selectedCategory,
    OpenStatus: JSON.parse(openFilter) as boolean,
  });

  function getDotColor(hvec: number): string {
    if (hvec <= 0) return '#ef4444';
    if (hvec < 10) return '#f97316';
    return '#22c55e';
  }

  const handleMarkerClick = useCallback((unit: CareUnit) => {
    store.set(selectedCareUnitAtom, unit);
    store.set(detailSheetOpenAtom, true);
    store.set(detailSheetPageAtom, 'detail');
  }, []);

  function getCategoryColor(category: string) {
    switch (category) {
      case 'hospital':
        return '#3B82F6'; // 파랑
      case 'pharmacy':
        return '#10B981'; // 초록
      case 'emergency':
        return '#F77D8A'; // 옅은 파스텔 분홍색

      default:
        return '#6B7280'; // 회색
    }
  }

  function createMarkersWithOverlay({
    map,
    data,
  }: {
    map: kakao.maps.Map;
    data: any[];
  }) {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    data.forEach((unit, index) => {
      const position = new kakao.maps.LatLng(unit.lat, unit.lng);

      const isOpen = unit.nowOpen;
      const isEmergency = unit.category === 'emergency';
      const hvec = unit.congestion?.hvec ?? -1;
      const level: CongestionLevel = unit.congestion?.level ?? 'LOW';

      const categoryColor = getCategoryColor(unit.category); // 진한 원색
      const backgroundColor = isOpen ? categoryColor : '#6B7280';
      const iconHtml = getCategoryIconSvg(unit.category); // 아이콘 선은 항상 흰색

      // hvec 표시 (응급실만)
      const hvecDots = isEmergency
        ? `<div style="position:absolute;top:-4px;right:-4px;display:flex;gap:1px;">${`<span style="color:${getDotColor(hvec)};font-size:12px;"
              className="${congestionClassMap[level]}">●</span>`}</div>`
        : '';

      const overlayId = `custom-overlay-${index}`;

      const overlay = new kakao.maps.CustomOverlay({
        position,
        content: `
        <div id="${overlayId}"
          style="position:relative;width:36px;height:36px;
          display:flex;align-items:center;justify-content:center;
          border-radius:100%;background:${backgroundColor};
          border:1px solid #e5e7eb;
          box-shadow:0 2px 6px rgba(0,0,0,0.08);
          cursor:pointer;">
          ${iconHtml}${hvecDots}
        </div>`,
        yAnchor: 1,
      });

      overlay.setMap(map);
      markersRef.current.push(overlay);

      //todo: requestAnimationFrame으로 변경하기
      setTimeout(() => {
        const el = document.getElementById(overlayId);
        if (el) {
          el.addEventListener('click', () => {
            handleMarkerClick(unit);
          });
        }
      }, 0);
    });
  }

  function fitMapToBounds(map: kakao.maps.Map, lat: number, lng: number) {
    const bounds = new kakao.maps.LatLngBounds(
      new kakao.maps.LatLng(lat - radius, lng - radius),
      new kakao.maps.LatLng(lat + radius, lng + radius)
    );
    map.setBounds(bounds);
  }

  useEffect(() => {
    if (!window.kakao?.maps || !mapRef.current) return;
    window.kakao.maps.load(() => {
      const center = new kakao.maps.LatLng(37.5665, 126.978);
      const map = new kakao.maps.Map(mapRef.current!, {
        center,
        level: level ?? 1,
      });

      mapInstance.current = map;
      setIsMapReady(true);

      kakao.maps.event.addListener(map, 'idle', () => {
        const currentLevel = map.getLevel();

        setLevel((prev) => {
          if (prev !== currentLevel) {
            setIsManualZoom(true); // 사용자가 직접 줌했단 뜻
            return currentLevel;
          }
          return prev;
        });

        const c = map.getCenter();
        setLat((prev) => {
          //  lat이 진짜 바뀔 때만 set
          if (prev === null) return c.getLat();
          if (Math.abs(prev - c.getLat()) > 0.00001) return c.getLat();
          return prev;
        });
        setLng((prev) => {
          // lng이 진짜 바뀔 때만 set
          if (prev === null) return c.getLng();
          if (Math.abs(prev - c.getLng()) > 0.00001) return c.getLng();
          return prev;
        });
      });
    });
  }, []);

  useEffect(() => {
    const fallbackToLocalStorage = () => {
      const storedLat = sessionStorage.getItem('user_lat');
      const storedLng = sessionStorage.getItem('user_lng');
      const storedAddress = sessionStorage.getItem('user_address');

      if (storedLat && storedLng) {
        const lat = parseFloat(storedLat);
        const lng = parseFloat(storedLng);
        setInitialLocation({ lat, lng });
        setLat(lat);
        setLng(lng);
        if (storedAddress) setLocation(storedAddress);
      } else {
        setShowSearchFallback(true);
      }
    };

    const timer = setTimeout(() => fallbackToLocalStorage(), 10000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        const { latitude, longitude } = pos.coords;
        setInitialLocation({ lat: latitude, lng: longitude });
        setLat(latitude);
        setLng(longitude);

        convertCoordsToDong(latitude, longitude).then((address) => {
          setLocation(address);
          sessionStorage.setItem('user_lat', latitude.toString());
          sessionStorage.setItem('user_lng', longitude.toString());
          sessionStorage.setItem('user_address', address);
        });
      },
      (err) => {
        clearTimeout(timer);
        fallbackToLocalStorage();
      },
      { enableHighAccuracy: true }
    );

    return () => clearTimeout(timer);
  }, []);
  // 1. 마커 그리기
  useEffect(() => {
    const map = mapInstance.current;
    if (!isMapReady || !map || !data) return;
    createMarkersWithOverlay({ map, data });
  }, [isMapReady, data]);

  // 2. bounds 설정
  useEffect(() => {
    const map = mapInstance.current;
    if (!isMapReady || !map || lat == null || lng == null || isManualZoom)
      return;
    fitMapToBounds(map, lat, lng);
  }, [isMapReady, lat, lng, isManualZoom]);

  //3. 사용자위치
  const currentLocationOverlayRef = useRef<kakao.maps.CustomOverlay | null>(
    null
  );

  useEffect(() => {
    const map = mapInstance.current;
    const { lat, lng } = initialLocation;
    if (!map || lat == null || lng == null) return;

    const position = new kakao.maps.LatLng(lat, lng);

    // 기존 오버레이 제거
    if (currentLocationOverlayRef.current) {
      currentLocationOverlayRef.current.setMap(null);
    }

    // 파란 점 스타일
    const content = `
    <div style="
      width: 12px;
      height: 12px;
      background: #007aff;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 0 6px rgba(0, 122, 255, 0.8);
    "></div>
  `;

    const overlay = new kakao.maps.CustomOverlay({
      position,
      content,
      yAnchor: 0.5,
      xAnchor: 0.5,
    });

    overlay.setMap(map);
    currentLocationOverlayRef.current = overlay;
  }, [initialLocation.lat, initialLocation.lng, isMapReady]);

  const handleFirstLocationButton = () => {
    const { lat, lng } = initialLocation;
    setLat(lat);
    setLng(lng);
    setLevel(1); // 상태 갱신
    mapInstance.current?.setCenter(new kakao.maps.LatLng(lat, lng));
    if (mapInstance.current) {
      fitMapToBounds(mapInstance.current, lat, lng);
      mapInstance.current?.setLevel(1); // 지도에 적용
    }
    convertCoordsToDong(lat, lng).then(setLocation);
  };
  const handleHospitalSelect = (v: { lat: string; lng: string }) => {
    const lat = parseFloat(v.lat);
    const lng = parseFloat(v.lng);
    setLat(lat);
    setLng(lng);
    setInitialLocation({ lat, lng });

    convertCoordsToDong(lat, lng).then((address) => {
      setLocation(address);

      setLevel(1);
      mapInstance.current?.setLevel(1);
    });

    if (mapInstance.current) {
      fitMapToBounds(mapInstance.current, lat, lng);
    }
  };

  const handleZoom = (dir: 'in' | 'out') => {
    const map = mapInstance.current;
    if (!map) return;

    const currentLevel = map.getLevel();
    const newLevel = dir === 'in' ? currentLevel - 1 : currentLevel + 1;

    setIsManualZoom(true);
    setLevel(newLevel); // 상태 갱신
    map.setLevel(newLevel); // 지도에 적용
  };
  const handleSelectAddress = ({
    name,
    address,
    lat,
    lng,
  }: {
    name: string;
    address: string;
    lat: string;
    lng: string;
  }) => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    setLat(latNum);
    setLng(lngNum);
    setInitialLocation({ lat: latNum, lng: lngNum });
    setLocation(address);
    setLevel(1);

    // 저장
    sessionStorage.setItem('user_lat', lat);
    sessionStorage.setItem('user_lng', lng);
    sessionStorage.setItem('user_address', address);

    if (mapInstance.current) {
      mapInstance.current.setCenter(new kakao.maps.LatLng(latNum, lngNum));
      mapInstance.current.setLevel(1);
    }
  };
  return (
    <div>
      <div className="flex justify-between flex-wrap items-center gap-[10px] !m-2 !overscroll-none">
        <div className="flex justify-between gap-4">
          <Label className="text-sm text-muted-foreground">
            현재 위치: {location ?? '위치 없음'}
          </Label>
          <Button
            variant="outline"
            size="sm"
            className="text-xs "
            onClick={handleFirstLocationButton}
          >
            현재 위치로
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs "
            onClick={() => setHospitalSearchModal(true)}
          >
            위치 검색
          </Button>
        </div>
      </div>

      <div className="relative h-[calc(100vh-64px)] !pb-[72px]">
        <div ref={mapRef} className="w-full h-full  bg-gray-100 z-0" />
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="w-9 h-9 text-xl bg-white hover:bg-primary rounded-md shadow-sm"
            onClick={() => handleZoom('in')}
          >
            +
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="w-9 h-9 text-xl bg-white hover:bg-primary rounded-md shadow-sm"
            onClick={() => handleZoom('out')}
          >
            −
          </Button>

          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="w-9 h-9 bg-white rounded-md shadow-sm disabled:[bg-slate-500 text-white]"
              disabled={data.length === 0}
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

      {/*  Fallback 모달 */}
      <LocationSearchModal
        title="위치 입력 "
        subtitle="위치정보가 허용되어 있지 않습니다. 현재 위치를 입력해주세요."
        open={showSearchFallback}
        onClose={() => setShowSearchFallback(false)}
        onSelect={handleSelectAddress}
      />

      <LocationSearchModal
        subtitle="주소와 키워드로 검색하세요"
        title="위치 검색"
        open={hospitalSearchModal}
        onClose={() => setHospitalSearchModal(false)}
        onSelect={handleHospitalSelect}
      />
    </div>
  );
}
