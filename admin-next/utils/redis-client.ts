import exec from 'await-exec';
import { createClient } from 'redis';
import { __isDev__ } from '../config';

const getRedisHost = async (): string => {
    if (__isDev__) {
        const { stdout, stderr } = await exec(`dinghy ip`);
        if (stderr) {
            // We are on linux if no dinghy.
            return '127.0.0.1';
        }
        // Only in development and on MacOS, we must use dinghy IP.
        if (stdout) {
            const dinghyIp = stdout;
            console.info('Redis is using your current dinghy IP: ' + dinghyIp);
            return dinghyIp.replace(/(\r\n|\n|\r)/gm, '');
        }
    }
    return process.env.SYMFONY_REDIS_HOST || '127.0.0.1';
};

let redisClient = null;
const getRedisClient = async () => {
    if (redisClient) {
        return redisClient;
    }
    const host = await getRedisHost();
    redisClient = createClient({ socket: { host } });

    redisClient.on('error', err => console.log('Redis Client Error', err));

    await redisClient.connect();
    return redisClient;
};

export default getRedisClient;
