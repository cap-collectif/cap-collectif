export default describe('redis-client', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it('can resolve default redis host', async () => {
        const { getRedisHost } = await import('./redis-client');
        const host = await getRedisHost();
        expect(host).toBe('127.0.0.1');
    });

    it('can resolve redis host on production', async () => {
        process.env.SYMFONY_REDIS_HOST = '4.5.6.7';
        const { getRedisHost } = await import('./redis-client');
        const host = await getRedisHost();
        expect(host).toBe('4.5.6.7');
    });
});
