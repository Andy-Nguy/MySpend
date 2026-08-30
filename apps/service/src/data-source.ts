import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { ProfileEntity } from './entities/profile/profile.entity';
import { CreateProfiles20260830000000 } from './migrations/20260830000000-create-profiles';

dotenv.config();

const isSsl =
  process.env.DATABASE_SSL === 'true' ||
  (process.env.DATABASE_URL?.includes('supabase.co') ?? false) ||
  (process.env.DATABASE_URL?.includes('supabase.com') ?? false);

export const AppDataSource = new DataSource({
  type: 'postgres',
  url:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgrespassword@localhost:5432/myspend_db',
  synchronize: false,
  logging:
    process.env.DATABASE_LOGGING !== undefined
      ? process.env.DATABASE_LOGGING === 'true'
      : process.env.NODE_ENV !== 'production',
  entities: [ProfileEntity],
  migrations: [CreateProfiles20260830000000],
  ssl: isSsl ? { rejectUnauthorized: false } : false,
});
