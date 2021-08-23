import getRedisClient from './redis-client';
import { env } from '../config';

const getRedisSessionKey = (cookie: string) => {
    // We have a potential bug here, because we does not check `.lock` session key, too.
    return `session_json_new_${env}_${cookie}`;
};

const getSessionFromSessionCookie = async (cookie: string): string | null => {
    const sessionKey = getRedisSessionKey(cookie);
    const redisClient = await getRedisClient();
    const redisSession = await redisClient.get(sessionKey);

    return redisSession;
};

export default getSessionFromSessionCookie;
