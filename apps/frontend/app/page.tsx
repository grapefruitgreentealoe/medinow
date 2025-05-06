import { getCareUnitById } from '@/shared/api';
import type { Metadata, ResolvingMetadata } from 'next';
import dayjs from 'dayjs';
import HomePageClient from '@/features/map/ui/HomePage';
import { PageProps } from '@/.next/types/app/page';

// 동적 메타데이터 생성
export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { careUnitId } = await searchParams;
  if (typeof careUnitId !== 'string') return fallbackMeta;
  try {
    const unit = await getCareUnitById(careUnitId);

    const day = dayjs().format('dddd').toLowerCase();
    const open = unit[`${day}Open` as keyof typeof unit] ?? null;
    const close = unit[`${day}Close` as keyof typeof unit] ?? null;

    const timeText =
      open && close
        ? `오늘은 ${formatTime(open as number)}부터 ${formatTime(close as number)}까지 진료합니다.`
        : '오늘은 휴무입니다.';

    const departments = unit.departments?.map((d) => d.name).join(', ') ?? '';
    const categoryLabel =
      {
        hospital: '병원',
        emergency: '응급실',
        pharmacy: '약국',
      }[unit.category] ?? '의료기관';

    const desc = `${unit.name}은(는) ${unit.address}에 위치한 ${categoryLabel}이에요. ${timeText} 진료과: ${departments}`;

    return {
      title: `${unit.name} 정보 - MediNow`,
      description: desc,
      openGraph: {
        title: `${unit.name} | MediNow`,
        description: desc,
        url: `https://medinow.co.kr/?careUnitId=${careUnitId}`,
        siteName: 'MediNow',
        images: [
          {
            url: 'https://medinow.co.kr/og-image.png',
            width: 1200,
            height: 630,
            alt: 'MediNow 미리보기 이미지',
          },
        ],
        locale: 'ko_KR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${unit.name} | MediNow`,
        description: desc,
        images: ['https://medinow.co.kr/og-image.png'],
      },
    };
  } catch (e) {
    console.error('메타데이터 생성 실패', e);
    return fallbackMeta;
  }
}

const fallbackMeta: Metadata = {
  title: 'MediNow - 내 주변 의료기관 찾기',
  description: '내 주변 병원, 약국, 응급실을 쉽게 찾고 소통하세요.',
};

function formatTime(value: number): string {
  const hour = Math.floor(value / 100);
  const minute = value % 100;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export default function Page() {
  return <HomePageClient />;
}
