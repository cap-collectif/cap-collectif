import { SymfonyEnv } from './types';

// We need to know if we are in dev or production.
export const env: SymfonyEnv = process.env.SYMFONY_ENV || 'dev';

export const __isDev__ = env === 'dev';
