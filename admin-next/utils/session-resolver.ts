import getRedisClient from './redis-client';
import { getEnv } from '../config';

const getRedisSessionKey = (cookie: string) => {
    // We have a potential bug here, because we does not check `.lock` session key, too.
    if (!process.env.SYMFONY_REDIS_PREFIX) {
        throw new Error('Please define SYMFONY_REDIS_PREFIX in env')
    }
    const prefix = process.env.SYMFONY_REDIS_PREFIX || 'dev'
    return `${prefix}session_json_new_${getEnv()}_${cookie}`;
};

const getSessionFromSessionCookie = async (cookie: string): string | null => {
    const sessionKey = getRedisSessionKey(cookie);
    const redisClient = await getRedisClient();
    const redisSession = await redisClient.get(sessionKey);

    return redisSession;
};

export default getSessionFromSessionCookie;
