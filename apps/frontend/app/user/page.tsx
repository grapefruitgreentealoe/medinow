// app/user/page.tsx (SSR 그대로 가능)
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export default async function UserPage() {
  const cookieStore = await cookies();
  const token = Array.from(cookieStore)[0][1].value;

  let role = null;
  let email = null;

  const decoded = jwt.decode(token) as any;
  role = decoded.role;
  email = decoded.email;

  return (
    <div>
      <h1>안녕하세요, {role}님</h1>
      <p>이메일: {email}</p>
    </div>
  );
}
