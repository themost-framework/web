const {DataCacheStrategy} = require('@themost/data');
const {CacheStrategy} = require('../cache');
async function finalizeAppAsync(app) {
    const cache = app.getStrategy(CacheStrategy);
    if (typeof cache.finalize === 'function') {
        await cache.finalize();
    }
    const dataCache = app.getConfiguration().getStrategy(DataCacheStrategy);
    // noinspection JSUnresolvedReference
    if (typeof dataCache.finalize === 'function') {
        // noinspection JSUnresolvedReference
        await dataCache.finalize();
    }
}

export {
    finalizeAppAsync
}