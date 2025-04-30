import type { Metadata } from 'next';
import HomePageClient from '@/features/map/ui/HomePage';
import { useEffect } from 'react';

export const metadata: Metadata = {
  title: 'MediNow - 내 주변 의료기관 찾기',
  description: '내 주변 병원, 약국, 응급실을 쉽게 찾고 소통하세요.',
  openGraph: {
    title: 'MediNow - 내 주변 의료기관 찾기',
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
    title: 'MediNow - 내 주변 의료기관 찾기',
    description: '내 주변 병원, 약국, 응급실을 쉽게 찾고 소통하세요.',
    images: ['https://medinow.com/og-image.png'],
  },
};

export default function Page() {
  // layout 또는 client component에서 useEffect 사용
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return <HomePageClient />;
}
