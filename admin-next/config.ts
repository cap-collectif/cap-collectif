import { SymfonyEnv } from './types';

// We need to know if we are in dev or production.
export const getEnv = (): SymfonyEnv => {
    const env =
        process.env.SYMFONY_ENV || (process.env.SYMFONY_REDIS_HOST === 'redis' ? 'test' : 'dev');

    return env;
};

export const __isDev__ = getEnv() === 'dev';

export const __isTest__ = getEnv() === 'test';

export const BASE_PATH = process.env.PRODUCTION ? '/admin-next' : '';

export const getBaseUrl = (): string => {

    if (typeof window === 'undefined') {
        return ''
    }

    return `${window.location.protocol}//${window.location.host}`;
};

export const getBaseUrlWithAdminNextSupport = (): string => {
    if (__isDev__) {
        return 'https://capco.dev';
    }
    return getBaseUrl();
};

export const getApiUrl = (): string => {
    const apiBaseUrl = getBaseUrlWithAdminNextSupport();
    return `${apiBaseUrl}/api`;
}