import Script from 'next/script';
import { cookies } from 'next/headers';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import HeaderWithSocket from '@/shared/ui/layout/HeaderWithSocket';
import { AuthStateInitializer } from '@/shared/provider/AuthStateInitializer';

export const metadata = {
  title: 'MediNow',
  description: '내 주변 의료기관 찾기',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const payload = token
    ? JSON.parse(
        Buffer.from(token?.split('.')[1] ?? '', 'base64').toString('utf-8')
      )
    : {};
  const isLoggedIn = !!token;
  const role = payload?.role || '';
  return (
    <html lang="ko">
      <head>
        <>
          <Script
            strategy="beforeInteractive"
            src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY}&libraries=services&autoload=false`}
          />
        </>
      </head>
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <AuthStateInitializer isLoggedIn={isLoggedIn} userRole={role}>
          <HeaderWithSocket />
          <main className="flex-1 !pt-[61px]">{children}</main>
        </AuthStateInitializer>
        <Toaster position="bottom-center" duration={1000} />
      </body>
    </html>
  );
}
