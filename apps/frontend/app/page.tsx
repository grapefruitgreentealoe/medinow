import type { Metadata } from 'next';
import { getCareUnitById } from '@/shared/api';
import { default as HomePageClient } from '@/features/map/ui/HomePage';

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const careUnitId = searchParams?.careUnitId;

  if (careUnitId && typeof careUnitId === 'string') {
    try {
      const unit = await getCareUnitById(careUnitId);

      return {
        title: `MediNow - ${unit.name} 주변 의료기관 찾기`,
        description: `${unit.name} 근처의 병원, 약국, 응급실을 쉽게 찾고 소통하세요.`,
        openGraph: {
          title: `MediNow - ${unit.name}`,
          description: `${unit.name} 근처의 의료기관을 찾아보세요.`,
          url: `https://medinow.com/?careUnitId=${careUnitId}`,
          siteName: 'MediNow',
          images: [
            {
              url: 'https://medinow.com/og-image.png',
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
          title: `MediNow - ${unit.name}`,
          description: `${unit.name} 주변의 병원, 약국, 응급실을 쉽게 찾고 소통하세요.`,
          images: ['https://medinow.com/og-image.png'],
        },
      };
    } catch (e) {
      console.error('careUnitId 메타데이터 불러오기 실패:', e);
    }
  }

  return {
    title: 'MediNow - 내 주변 의료기관 찾기',
    description: '내 주변 병원, 약국, 응급실을 쉽게 찾고 소통하세요.',
    openGraph: {
      title: 'MediNow',
      description: '내 주변 병원, 약국, 응급실을 쉽게 찾고 소통하세요.',
      url: 'https://medinow.com',
      siteName: 'MediNow',
      images: [
        {
          url: 'https://medinow.com/og-image.png',
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
      title: 'MediNow',
      description: '내 주변 병원, 약국, 응급실을 쉽게 찾고 소통하세요.',
      images: ['https://medinow.com/og-image.png'],
    },
  };
}

export default function Page() {
  return <HomePageClient />;
}
