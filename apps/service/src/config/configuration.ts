export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgrespassword@localhost:5432/myspend_db',
  databaseSsl:
    process.env.DATABASE_SSL === 'true' ||
    Boolean(process.env.DATABASE_URL?.includes('supabase.co')) ||
    Boolean(process.env.DATABASE_URL?.includes('supabase.com')),
  databaseLogging:
    process.env.DATABASE_LOGGING !== undefined
      ? process.env.DATABASE_LOGGING === 'true'
      : process.env.NODE_ENV !== 'production',
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-jwt-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
});
