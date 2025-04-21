'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

interface HospitalSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (data: {
    name: string;
    address: string;
    lat: string;
    lng: string;
  }) => void;
}

export default function HospitalSearchModal({
  open,
  onClose,
  onSelect,
}: HospitalSearchModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    window.kakao.maps.load(() => {
      const mapInstance = new window.kakao.maps.Map(
        mapRef.current as HTMLElement,
        {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 3,
        }
      );
      setMap(mapInstance);
    });
  }, [loaded, setMap]);

  const search = (e: { preventDefault: () => void }) => {
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

  if (!open) return null;

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY}&libraries=services&autoload=false`}
        onLoad={() => setLoaded(true)}
      />
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-md shadow-lg w-[90vw] max-w-xl">
          <h2 className="text-lg font-bold mb-2">병원 검색</h2>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="병원명으로 검색"
              className="border rounded px-2 py-1 w-full text-black"
            />
            <button
              onClick={search}
              className="bg-blue-500 text-white px-4 py-1 rounded"
            >
              검색
            </button>
          </div>
          <div ref={mapRef} className="w-full my-2 " />
          <ul className="max-h-40 overflow-auto space-y-1">
            {places.map((place, i) => (
              <li
                key={i}
                className="p-2 border rounded cursor-pointer hover:bg-gray-100 text-black"
                onClick={() => handleSelect(place)}
              >
                <strong>{place.place_name}</strong>
                <br />
                <span className="text-sm text-gray-500">
                  {place.road_address_name || place.address_name}
                </span>
              </li>
            ))}
          </ul>
          <div className="text-right mt-2">
            <button
              onClick={onClose}
              className="text-sm text-gray-600 hover:underline"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
