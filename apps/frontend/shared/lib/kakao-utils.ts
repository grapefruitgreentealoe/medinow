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
