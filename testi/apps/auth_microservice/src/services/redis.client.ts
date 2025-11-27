import Redis from 'ioredis';
import dotenv from 'dotenv';
import { log } from 'console';

dotenv.config()

const redisHost=process.env.REDIS_HOST || 'redis'
const redisPort=Number(process.env.REDIS_PORT) || 6379
const redisPassword= process.env.REDIS_PASSWORD 

const redisClient =new Redis ({
    host: redisHost,
    port: redisPort,
    password: redisPassword,

    maxRetriesPerRequest: 3,
})

redisClient.on('connect',() =>{
    console.log('[Auth Service] Connected to Redis successfully!');
})

redisClient.on('error',(err)=>{
    console.error('[Auth Service] Could not connect to Redis:', err);
})

export default redisClient