// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
var ConfigurationBase = require('@themost/common').ConfigurationBase;
var TraceUtils = require('@themost/common').TraceUtils;
var PathUtils = require('@themost/common').PathUtils;
var Symbol = require('symbol');
var _ = require('lodash');

var routesProperty = Symbol('routes');

class HttpConfiguration extends ConfigurationBase {
    /**
     * @class
     * @constructor
     * @param {string} configPath
     * @augments ConfigurationBase
     */
    constructor(configPath) {
        super(configPath);
        if (!this.hasSourceAt('mimes')) { this.setSourceAt('mimes',[]); }
        if (!this.hasSourceAt('engines')) { this.setSourceAt('engines',[]); }
        if (!this.hasSourceAt('controllers')) { this.setSourceAt('controllers',[]); }
        if (!this.hasSourceAt('handlers')) { this.setSourceAt('handlers',[]); }
        try {
            this[routesProperty] = require(PathUtils.join(this.getConfigurationPath(),'routes.json'))
        }
        catch(err) {
            if (err.code === 'MODULE_NOT_FOUND') {
                this[routesProperty] = require('./resources/routes.json');
            }
            else {
                TraceUtils.error('An error occurred while loading routes collection');
                TraceUtils.error(err);
            }
        }
        /**
         * @name HttpConfiguration#engines
         * @type {Array.<HttpViewEngineConfiguration>}
         */

        Object.defineProperty(this, 'engines', {
            get:function() {
                return this.getSourceAt('engines');
            }
        });


        /**
         * @name HttpConfiguration#mimes
         * @type {Array.<MimeTypeConfiguration>}
         */

        Object.defineProperty(this, 'mimes', {
            get:function() {
                return this.getSourceAt('mimes');
            }
        });

        /**
         * @name HttpConfiguration#routes
         * @type {Array.<HttpRouteConfiguration>}
         */

        Object.defineProperty(this, 'routes', {
            get:function() {
                return this[routesProperty];
            }
        });

        /**
         * @name HttpConfiguration#controllers
         * @type {Array}
         */

        Object.defineProperty(this, 'controllers', {
            get:function() {
                return this.getSourceAt('controllers');
            }
        });

        /**
         * @name HttpConfiguration#handlers
         * @type {Array.<HttpHandlerConfiguration>}
         */

        Object.defineProperty(this, 'handlers', {
            get:function() {
                return this.getSourceAt('handlers');
            }
        });

    }

    /**
     * Gets a mime type based on the given extension
     * @param {string} extension
     * @returns {*}
     */
    getMimeType(extension) {
        return _.find(this.mimes,function(x) {
            return (x.extension===extension) || (x.extension==='.'+extension);
        });
    }
}

module.exports = {
    HttpConfiguration
}