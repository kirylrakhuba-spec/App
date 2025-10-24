import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Account } from './entities/account.entity';
import { Profile } from './entities/profile.entity';
import { ProfileFollow } from './entities/profile-follow.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'innogram_user',
  password: process.env.POSTGRES_PASSWORD || 'innogram_password',
  database: process.env.POSTGRES_DB || 'innogram',
  entities: [User, Account, Profile, ProfileFollow],
  migrations: ['./apps/core_microservice/src/database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
