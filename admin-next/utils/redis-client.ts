import { createClient } from 'redis';
type RedisClient = ReturnType<typeof createClient>;

export const getRedisHost = (): string => {
    const ip = process.env.SYMFONY_REDIS_HOST || '127.0.0.1';
    console.info('Connecting to Redis using IP: ' + ip);
    return ip;
};


let redisClient: RedisClient | null = null;
const getRedisClient = async () => {
    if (redisClient) {
        return redisClient;
    }
    const host = getRedisHost();
    redisClient = createClient({ socket: { host } });

    redisClient.on('error', err => console.log('Redis Client Error', err));

    await redisClient.connect();
    return redisClient;
};

export default getRedisClient;
