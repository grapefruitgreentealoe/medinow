import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.PORT,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtAccessExpirationTime: process.env.JWT_ACCESS_EXPIRATION_TIME,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpirationTime: process.env.JWT_REFRESH_EXPIRATION_TIME,
}));
