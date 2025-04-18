'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import axiosInstance from '@/lib/axios';

export default function Header() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      const res = await axiosInstance.post('/auth/logout', null, {
        withCredentials: true,
      });
      if (res.status == 200) {
        logout();
        localStorage.removeItem('isLogin');
        localStorage.removeItem('isAdmin');
        router.push('/');
      }
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
