const config = jest.doMock('../config', () => ({
    __isDev__: true,
}));
const exec = jest.fn();
jest.doMock('./await-exec', () => ({
    __esModule: true,
    default: exec,
}));

describe('redis-client', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it('can resolve redis host on MacOS', async () => {
        exec.mockReturnValue(Promise.resolve({ error: null, stdout: '1.2.3.4\n' }));
        const { getRedisHost } = await import('./redis-client');
        const host = await getRedisHost();
        expect(host).toBe('1.2.3.4');
    });

    it('can resolve redis host on Linux', async () => {
        exec.mockReturnValue(Promise.resolve({ error: 'command not found: dinghy', stdout: null }));
        const { getRedisHost } = await import('./redis-client');
        const host = await getRedisHost();
        expect(host).toBe('127.0.0.1');
    });

    it('can fallback redis host on production', async () => {
        const config = jest.doMock('../config', () => ({
            __isDev__: false,
        }));
        const { getRedisHost } = await import('./redis-client');
        const host = await getRedisHost();
        expect(host).toBe('127.0.0.1');
    });

    it('can resolve redis host on production', async () => {
        const config = jest.doMock('../config', () => ({
            __isDev__: false,
        }));
        process.env.SYMFONY_REDIS_HOST = '4.5.6.7';
        const { getRedisHost } = await import('./redis-client');
        const host = await getRedisHost();
        expect(host).toBe('4.5.6.7');
    });
});
