import LoginForm from '@/features/auth/ui/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex items-start justify-center min-h-[80vh] !px-4 !mt-[30px]">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-xl font-bold text-center text-primary">로그인</h1>
        <div className="h-[90px]" />
        <LoginForm />
      </div>
    </div>
  );
}
