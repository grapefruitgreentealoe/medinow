import Script from 'next/script';
import { cookies } from 'next/headers';
import './globals.css';
import Header from '@/shared/ui/layout/Header';
import { FloatingChatWidget } from '@/widgets/chat/FloatingChatWidget';
import { Toaster } from '@/components/ui/sonner';

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
              __html: `window.__INITIAL_IS_LOGGED_IN__ = ${JSON.stringify(isLoggedIn)};
              window.__USER_ROLE__ = '${role}';
              `,
            }}
          />
          <Script
            strategy="beforeInteractive"
            src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY}&libraries=services&autoload=false`}
          />
        </>
      </head>
      <body suppressHydrationWarning>
        <Header />
        <main>{children}</main>

        <Toaster position="bottom-center" duration={1000} />
      </body>
    </html>
  );
}
