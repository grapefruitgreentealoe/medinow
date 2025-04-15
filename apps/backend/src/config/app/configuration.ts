import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtAccessExpirationTime: parseInt(
    process.env.JWT_ACCESS_EXPIRATION_TIME || '3600',
    10,
  ),
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpirationTime: parseInt(
    process.env.JWT_REFRESH_EXPIRATION_TIME || '604800',
    10,
  ),
  serviceKey: process.env.SERVICE_KEY,
  emergencyApiUrl: process.env.EMERGENCY_API_URL,
  hospitalApiUrl: process.env.HOSPITAL_API_URL,
  pharmacyApiUrl: process.env.PHARMACY_API_URL,
}));
