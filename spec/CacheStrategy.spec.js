const {resolve} = require('path');
const { CacheStrategy, HttpApplication } = require('../index');

describe('CacheStrategy', () => {
    /**
     * @type {import('../index').HttpApplication}
     */
    let app;
    beforeAll(async () => {
        app = new HttpApplication(resolve(__dirname, 'app1'));
    });
    afterAll(async () => {
        await app.getStrategy(CacheStrategy).finalizeAsync();
    });

    afterEach(async () => {
        const cache = app.getStrategy(CacheStrategy);
        await cache.clear();
    })

    it('should get cached item', async () => {
        const cache = app.getStrategy(CacheStrategy);
        expect(cache).toBeTruthy();
        let value = await cache.get('test-key');
        expect(value).toBeUndefined();
        await cache.add('test-key', {
            message: 'Hello World'
        });
        value = await cache.get('test-key');
        expect(value).toBeTruthy();
        expect(value.message).toBe('Hello World');
    });

    it('should remove cached item', async () => {
        const cache = app.getStrategy(CacheStrategy);
        expect(cache).toBeTruthy();
        let value = await cache.get('test-key');
        expect(value).toBeUndefined();
        await cache.add('test-key', {
            message: 'Hello World'
        });
        await cache.remove('test-key');
        value = await cache.get('test-key');
        expect(value).toBeUndefined();
    });

    it('should use absolute expiration', async () => {
        const cache = app.getStrategy(CacheStrategy);
        expect(cache).toBeTruthy();
        await cache.add('test-key', {
            message: 'Hello World'
        }, 1);
        let value = await cache.get('test-key');
        expect(value).toBeTruthy();
        // wait for 2 seconds
        await new Promise((resolve) => setTimeout(() => {
            return resolve(void 0);
        }, 2000));
        value = await cache.get('test-key');
        expect(value).toBeUndefined();
    });

    it('should clear cache', async () => {
        const cache = app.getStrategy(CacheStrategy);
        expect(cache).toBeTruthy();
        await cache.add('test-key-1', {
            message: 'Hello World'
        });
        await cache.add('test-key-2', {
            message: 'Hello World!'
        });
        let value = await cache.get('test-key-1');
        expect(value).toBeTruthy();
        await cache.clear();
        value = await cache.get('test-key-1');
        expect(value).toBeUndefined();
        value = await cache.get('test-key-2');
        expect(value).toBeUndefined();
    });

    it('should get default value', async () => {
        const cache = app.getStrategy(CacheStrategy);
        await cache.getOrDefault('test-key-1', async () => {
            return {
                message: 'Hello World'
            }
        });
        const value = await cache.get('test-key-1');
        expect(value).toBeTruthy();
        expect(value.message).toEqual('Hello World');
    });

    it('should get default null value', async () => {
        const cache = app.getStrategy(CacheStrategy);
        const getValue = async () => {
            return null;
        };
        await cache.getOrDefault('test-key-1', getValue);
        let value = await cache.get('test-key-1');
        expect(value).toBeNull();
    });

    it('should get default value once', async () => {
        const cache = app.getStrategy(CacheStrategy);
        let counter = 0;
        await cache.getOrDefault('test-key-1', async () => {
            counter++;
            return counter;
        });
        let value = await cache.get('test-key-1');
        expect(value).toEqual(1);
        counter++;
        value = await cache.get('test-key-1');
        expect(value).toEqual(1);
    });

});