import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: 'https://kdt-node-2-team02.elicecoding.com/api/v1',
    NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY: 'c44fa34e526434e6a2ed4a02e1ba8ed3pb',
  },
  /* config options here */
};

export default nextConfig;
