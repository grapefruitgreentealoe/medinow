import type { Metadata } from 'next';
import LandingPage from '@/features/landing/ui/LandingPage';

export const metadata: Metadata = {
  title: 'MediNow - 내 주변 의료기관 찾기',
  description: '내 주변 병원, 약국, 응급실을 쉽게 찾고 실시간으로 소통하세요.',
  openGraph: {
    title: 'MediNow - 내 주변 의료기관 찾기',
    description:
      '내 주변 병원, 약국, 응급실을 쉽게 찾고 실시간으로 소통하세요.',
    url: 'https://medinow.co.kr',
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
    title: 'MediNow - 내 주변 의료기관 찾기',
    description:
      '내 주변 병원, 약국, 응급실을 쉽게 찾고 실시간으로 소통하세요.',
    images: ['https://medinow.co.kr/og-image.png'],
  },
};

export default function Page() {
  return <LandingPage />;
}
