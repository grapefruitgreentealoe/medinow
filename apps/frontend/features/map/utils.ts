import { CareUnit, Department } from '../../shared/type';

export const formatTime = (time: number | null) => {
  if (time === null) return '없음';
  const h = Math.floor(time / 100);
  const m = time % 100;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const renderTodayTime = (unit: CareUnit) => {
  const day = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ][new Date().getDay()];

  const open = unit[`${day}Open` as keyof CareUnit] as number | null;
  const close = unit[`${day}Close` as keyof CareUnit] as number | null;

  if (open === null && close === null) {
    return '휴무';
  }

  return `${formatTime(open)} ~ ${formatTime(close)}`;
};

export const getCategoryIconSvg = (category: string) => {
  switch (category) {
    case 'emergency':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ambulance-icon lucide-ambulance"><path d="M10 10H6"/><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/><path d="M8 8v4"/><path d="M9 18h6"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`;
    case 'pharmacy':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`;
    case 'hospital':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v4"/><path d="M14 14h-4"/><path d="M14 18h-4"/><path d="M14 8h-4"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18"/></svg>`;
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#6B7280" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`;
  }
};

export async function convertCoordsToDong(
  lat: number,
  lng: number
): Promise<string> {
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
export async function getTMCoordFromLatLng(
  lng: number,
  lat: number
): Promise<{ x: number; y: number } | null> {
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/geo/transcoord.json?x=${lng}&y=${lat}&input_coord=WGS84&output_coord=TM`,
      {
        headers: {
          Authorization: `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}`,
        },
      }
    );
    const json = await res.json();
    const doc = json.documents?.[0];
    if (!doc) return null;
    return { x: doc.x, y: doc.y };
  } catch (e) {
    console.error('좌표 변환 실패', e);
    return null;
  }
}

export const openKakaoMap = async (unit: CareUnit) => {
  const { lng, lat, name, address } = unit;
  const result = await getTMCoordFromLatLng(lng, lat);
  if (!result) {
    alert('카카오 지도 이동에 실패했습니다.');
    return;
  }

  const kakaoUrl = `https://map.kakao.com/?q=${encodeURIComponent(
    name
  )}&urlX=${Math.round(result.x)}&urlY=${Math.round(result.y)}&road_address_name=${address}&urlLevel=2`;

  window.open(kakaoUrl, '_blank');
};
