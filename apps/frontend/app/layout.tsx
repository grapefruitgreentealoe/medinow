import Script from 'next/script';
import { cookies } from 'next/headers';
import './globals.css';
import Header from '@/shared/ui/layout/Header';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  console.log(token);

  return (
    <html lang="ko">
      <head>
        <Script
          strategy="beforeInteractive"
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY}&libraries=services&autoload=false`}
        />
      </head>
      <body suppressHydrationWarning>
        <Header isLoggedIn={!!token} />

        <main>{children}</main>
      </body>
    </html>
  );
}
