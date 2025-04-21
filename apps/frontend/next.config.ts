import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:4000/api/v1',
    NEXT_PUBLIC_KAKAO_REST_API_KEY: '69b2bb8d72109ebea926094b48913345',
    NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY: 'c44fa34e526434e6a2ed4a02e1ba8ed3',
  },
};
export default nextConfig;
