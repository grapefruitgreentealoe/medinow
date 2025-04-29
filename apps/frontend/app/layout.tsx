import Script from 'next/script';
import { cookies } from 'next/headers';
import './globals.css';
import Header from '@/shared/ui/layout/Header';
import { Toaster } from '@/components/ui/sonner';

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
            id="initial-is-logged-in"
            dangerouslySetInnerHTML={{
              __html: `window.__INITIAL_IS_LOGGED_IN__ = ${JSON.stringify(
                isLoggedIn
              )};
              window.__USER_ROLE__ = '${role}';`,
            }}
          />
          <Script
            strategy="beforeInteractive"
            src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY}&libraries=services&autoload=false`}
          />
        </>
      </head>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 !pt-[61px]">{children}</main>

        {/* 푸터 추가 */}
        <footer className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md !py-6 text-center text-sm text-muted-foreground z-50">
          <div>© 2025 MediNow. All rights reserved.</div>
          <div className="mt-1 text-xs">Created by 삼시세코</div>
        </footer>

        <Toaster position="bottom-center" duration={1000} />
      </body>
    </html>
  );
}
