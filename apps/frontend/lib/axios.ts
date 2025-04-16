import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // 예: https://api.example.com
  withCredentials: true, // 쿠키 전송 (refreshToken용)
});

export default axiosInstance;
