export default () => ({
  db: {
    dbHost: process.env.DATABASE_HOST,
    dbPort: process.env.DATABASE_PORT,
    dbUsername: process.env.DATABASE_USER,
    dbPassword: process.env.DATABASE_PASSWORD,
    dbName: process.env.DATABASE_NAME,
    dbSynchronize: process.env.DATABASE_SYNCHRONIZE,
    dbLogging: process.env.DATABASE_LOGGING,
  },
});
