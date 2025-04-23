export default () => ({
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    // password: process.env.REDIS_PASSWORD, // 비밀번호가 있을 경우 추가
  },
});
