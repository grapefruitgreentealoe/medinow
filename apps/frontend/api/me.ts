import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ role: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!); // 반드시 서버 비밀키 사용
    const { role, email, sub } = decoded as any;
    console.log(role, email, sub);
    return res.status(200).json({ role, email, sub });
  } catch (err) {
    return res.status(401).json({ role: null });
  }
}
