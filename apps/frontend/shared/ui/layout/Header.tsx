'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

import axiosInstance from '@/lib/axios';

export default function Header({
  isLoggedIn = false,
}: {
  isLoggedIn: boolean;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout', null, {
        withCredentials: true,
      });
      router.refresh();
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <header className="w-full px-6 py-4 border-b flex justify-between items-center bg-white">
      <Link href="/" className="text-xl font-bold ">
        <span className="text-black">🏥 Medinow</span>
      </Link>
      <nav className="flex gap-4">
        {isLoggedIn ? (
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-black"
          >
            로그아웃
          </Button>
        ) : (
          <>
            <Link href="/signup/admin">
              <Button variant="outline" className="text-black">
                관리자 회원가입
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="text-black">
                회원가입
              </Button>
            </Link>
            <Link href="/login">
              <Button>로그인</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
