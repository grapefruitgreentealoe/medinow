'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { locationByCategory } from '../api';

export default function NearbyCareUnits() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<kakao.maps.Map | null>(null);

  const [location, setLocation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    '전체' | '응급실' | '약국' | '병원'
  >('전체');
  const [selectedMarker, setSelectedMarker] = useState<CareUnit | null>(null);
  const [lat, setLat] = useState<number | null>(37.53539675015857);
  const [lng, setLng] = useState<number | null>(127.08360139310757);
  const markersRef = useRef<kakao.maps.Marker[]>([]);

  const { data: careUnits = [] } = useQuery<CareUnit[]>({
    queryKey: ['careUnits', lat, lng, selectedCategory],
    queryFn: () =>
      locationByCategory({
        lat: lat!,
        lng: lng!,
        level: 1,
        category:
          selectedCategory === '응급실'
            ? 'emergency'
            : selectedCategory === '병원'
              ? 'hospital'
              : selectedCategory === '약국'
                ? 'pharmacy'
                : undefined,
      }),
    enabled: lat !== null && lng !== null,
  });

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
      }
    );
  }, []);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !window.kakao?.maps ||
      lat === null ||
      lng === null
    )
      return;

    window.kakao.maps.load(() => {
      if (!mapRef.current) return;

      const center = new kakao.maps.LatLng(lat, lng);
      const map = new kakao.maps.Map(mapRef.current, {
        center,
        level: 4,
      });
      mapInstance.current = map;

      // ✅ 기존 마커 제거
      markersRef.current.forEach((m) => m.setMap(null));

      // ✅ 마커 새로 만들기
      const newMarkers: kakao.maps.Marker[] = [];

      careUnits.forEach((unit) => {
        const position = new kakao.maps.LatLng(unit.lat, unit.lng);
        // const imageSrc = `/markers/${getEmergencyMarkerColor(unit.available_beds)}.png`;
        const imageSrc = '/pin-png.png';
        const markerImage = new kakao.maps.MarkerImage(
          imageSrc,
          new kakao.maps.Size(36, 36)
        );

        const marker = new kakao.maps.Marker({
          map,
          position,
          image: markerImage,
        });

        kakao.maps.event.addListener(marker, 'click', () => {
          setSelectedMarker(unit);
        });

        newMarkers.push(marker);
      });

      // ✅ ref에 저장만!
      markersRef.current = newMarkers;
    });
  }, [careUnits, lat, lng]);

  return (
    <div className="p-4">
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

      <div
        ref={mapRef}
        className="w-full h-[400px] rounded-xl overflow-hidden bg-gray-100"
      />

      <Dialog
        open={!!selectedMarker}
        onOpenChange={() => setSelectedMarker(null)}
      >
        <DialogContent className="max-w-md">
          {selectedMarker && (
            <Card>
              <CardContent className="space-y-1">
                <h2 className="text-lg font-bold">{selectedMarker.name}</h2>
                <p>{selectedMarker.address}</p>
                <p>{selectedMarker.tel}</p>
                {selectedMarker.category === 'emergency' && (
                  <p className="text-sm text-destructive">
                    가용 병상: {selectedMarker.available_beds ?? '정보 없음'}
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

interface CareUnit {
  id: string;
  name: string;
  address: string;
  tel: string;
  category: string;
  available_beds?: number;
  lat: number;
  lng: number;
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
