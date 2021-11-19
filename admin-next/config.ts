import { SymfonyEnv } from './types';

// We need to know if we are in dev or production.
export const getEnv = (): SymfonyEnv => {
    const env = process.env.SYMFONY_ENV
        ? process.env.SYMFONY_ENV
        : process.env.SYMFONY_REDIS_HOST === 'redis'
        ? 'test'
        : 'dev';
    return env;
};

export const __isDev__ = getEnv() === 'dev';

export const __isTest__ = getEnv() === 'test';
