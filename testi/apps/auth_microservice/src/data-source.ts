import 'dotenv/config'; 
import { DataSource } from 'typeorm';
import { Account } from './entities/account.entity';

export const AppDataSource = new DataSource({
   
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'innogram_user',
  password: process.env.POSTGRES_PASSWORD || 'innogram_password',
  database: process.env.POSTGRES_DB || 'innogram',

  
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',

  entities: [Account], 
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
