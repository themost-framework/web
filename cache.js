// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
var NodeCache = require('node-cache');
var AbstractMethodError = require("@themost/common").AbstractMethodError;
var LangUtils = require('@themost/common').LangUtils;
var Args = require('@themost/common').Args;
var HttpApplicationService = require('./types').HttpApplicationService;
var CACHE_ABSOLUTE_EXPIRATION = 0;

/**
 * @abstract
 * @class
 */
class CacheStrategy extends HttpApplicationService {
    constructor(app) {
        super(app);
    }

    /**
     * Sets a key value pair in cache.
     * @abstract
     * @param {string} key - A string that represents the key of the cached value
     * @param {*} value - The value to be cached
     * @param {number=} absoluteExpiration - An absolute expiration time in seconds. This parameter is optional.
     * @returns {Promise|*}
     */
    add(key, value, absoluteExpiration) {
        throw new AbstractMethodError();
    }

    /**
     * Removes a cached value.
     * @abstract
     * @param {string} key - A string that represents the key of the cached value to be removed
     * @returns {Promise|*}
     */
    remove(key) {
        throw new AbstractMethodError();
    }

    /**
     * Flush all cached data.
     * @abstract
     * @returns {Promise|*}
     */
    clear() {
        throw new AbstractMethodError();
    }

    /**
     * Gets a cached value defined by the given key.
     * @param {string} key
     * @returns {Promise|*}
     */
    get(key) {
        throw new AbstractMethodError();
    }

    /**
     * Gets data from cache or executes the defined function and adds the result to the cache with the specified key
     * @param {string|*} key - A string which represents the key of the cached data
     * @param {Function} fn - A function to execute if data will not be found in cache
     * @param {number=} absoluteExpiration - An absolute expiration time in seconds. This parameter is optional.
     * @returns {Promise|*}
     */
    getOrDefault(key, fn, absoluteExpiration) {
        throw new AbstractMethodError();
    }
}

/**
 * DefaultCacheStrategy class that extends CacheStrategy.
 * @property @readonly {NodeCache} rawCache - Gets the raw cache object.
 * This class provides a default implementation for caching strategies.
 */
class DefaultCacheStrategy extends CacheStrategy {

    constructor(app) {
        super(app);
        //set absoluteExpiration (from application configuration)
        var expiration = CACHE_ABSOLUTE_EXPIRATION;
        var absoluteExpiration = LangUtils.parseInt(app.getConfiguration().getSourceAt('settings/cache/absoluteExpiration'));
        if (absoluteExpiration>=0) {
            expiration = absoluteExpiration;
        }
        Object.defineProperty(this, 'rawCache', {
            enumerable: false,
            configurable: true,
            writable: false,
            value: new NodeCache( {
                stdTTL:expiration
            })
        });
    }


    /**
     * Sets a key value pair in cache.
     * @abstract
     * @param {string} key - A string that represents the key of the cached value
     * @param {*} value - The value to be cached
     * @param {number=} absoluteExpiration - An absolute expiration time in seconds. This parameter is optional.
     * @returns {Promise|*}
     */
    add(key, value, absoluteExpiration) {
        var self = this;
        return new Promise(function(resolve, reject) {
            self.rawCache.set(key, value, absoluteExpiration, function(err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });

    }

    /**
     * Removes a cached value.
     * @abstract
     * @param {string} key - A string that represents the key of the cached value to be removed
     * @returns {Promise|*}
     */
    remove(key) {
        var self = this;
        return new Promise(function(resolve, reject) {
            self.rawCache.set(key, function(err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    }

    /**
     * Flush all cached data.
     * @abstract
     * @returns {Promise|*}
     */
    clear() {
        this.rawCache.flushAll();
        return Promise.resolve();
    }

    /**
     * Gets a cached value defined by the given key.
     * @param {string} key
     * @returns {Promise|*}
     */
    get(key) {
        var self = this;
        return new Promise(function(resolve, reject) {
           void self.rawCache.get(key, function(err, result) {
              if (err) {
                  return reject(err);
              }
              return resolve(result ? result[key] : null);
           });
        });
    }

    /**
     * Gets data from cache or executes the defined function and adds the result to the cache with the specified key
     * @param {string|*} key - A string which represents the key of the cached data
     * @param {function:Promise<any>} getValue - A function to execute if data will not be found in cache
     * @param {number=} absoluteExpiration - An absolute expiration time in seconds. This parameter is optional.
     * @returns {Promise|*}
     */
    getOrDefault(key, getValue, absoluteExpiration) {
        var self = this;
        Args.check(typeof getValue === 'function','Invalid argument. Expected function.');
        return self.get(key).then(function(res) {
            if (typeof res === 'undefined') {
                return getValue().then(function (res) {
                    if (res == null) {
                        return Promise.resolve(null);
                    }
                    return self.add(key, res, absoluteExpiration).then(function () {
                        return Promise.resolve(res);
                    });
                });
            }
            return Promise.resolve(res);
        });
    }
}

module.exports = {
    CacheStrategy,
    DefaultCacheStrategy
}
