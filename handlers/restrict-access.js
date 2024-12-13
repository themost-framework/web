// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
var _ = require('lodash');
var TraceUtils = require('@themost/common').TraceUtils;
var HttpUnauthorizedError = require('@themost/common').HttpUnauthorizedError;
var HttpBadRequestError = require('@themost/common').HttpBadRequestError;
var url = require('url');
/**
 * @class
 * @constructor
 */
// eslint-disable-next-line no-unused-vars
function LocationSetting() {
    /**
     * Gets or sets a string that represents the description of this object
     * @type {string}
     */
    this.description = null;
    /**
     * Gets or sets a string that represents the target path associated with access settings.
     * @type {*}
     */
    this.path = null;
    /**
     * Gets or sets a comma delimited string that represents the collection of users or groups where this access setting will be applied. A wildcard (*) may be used.
     * @type {*}
     */
    this.allow = null;
    /**
     * Gets or sets a string that represents the collection of users or groups where this access setting will be applied. A wildcard (*) may be used.
     * @type {*}
     */
    this.deny = null;
}
/**
 * @class
 * @constructor
 * @augments AuthorizeRequestHandler
 */
function RestrictHandler() {
    //
}
/**
 * Authenticates an HTTP request and sets user or anonymous identity.
 * @param {HttpContext} context
 * @param {Function} callback
 */
RestrictHandler.prototype.authorizeRequest = function (context, callback) {
    try {
        if (context.is('OPTIONS')) { return callback(); }
        if (context.user.name === 'anonymous')
        {
            RestrictHandler.prototype.isRestricted(context, function(err, result) {
                if (err) {
                    TraceUtils.error(err);
                    callback(new HttpUnauthorizedError('Access denied'));
                }
                else if (result) {
                    return callback(new HttpUnauthorizedError());
                }
                else {
                    callback();
                }
            });
        }
        else {
            callback();
        }
    }
    catch (e) {
        callback(e);
    }
};
/**
 * @param {HttpContext} context
 * @param {Function} callback
 * @returns {*}
 */
RestrictHandler.prototype.isNotRestricted = function(context, callback) {
    try {
        if (_.isNil(context)) {
            return callback(new HttpBadRequestError());
        }
        if (_.isNil(context.request)) {
            return callback(new HttpBadRequestError());
        }
        //get application settings
        var settings = context.getApplication().getConfiguration().settings;
        /**
         * @type {{loginPage:string=,locations:Array}|*}
         */
        settings.auth = settings.auth || {};
        //get login page, request url and locations
        var loginPage = settings.auth.loginPage || '/login.html',
            requestUrl = url.parse(context.request.url),
            locations = settings.auth.locations || [];
        if (requestUrl.pathname===loginPage) {
            return callback(null, true);
        }
        for (var i = 0; i < locations.length; i++) {
            /**
             * @type {*|LocationSetting}
             */
            var location = locations[i];
            if (/\*$/.test(location.path)) {
                //wildcard search /something/*
                if ((requestUrl.pathname.indexOf(location.path.replace(/\*$/,'')) === 0) && (location.allow === '*')) {
                    return callback(null, true);
                }
            }
            else {
                if ((requestUrl.pathname===location.path) && (location.allow === '*')) {
                    return callback(null, true);
                }
            }
        }
        return callback(null, false);
    }
    catch(err) {
        TraceUtils.error(err);
        return callback(null, false);
    }

};

RestrictHandler.prototype.isRestricted = function(context, callback) {
    RestrictHandler.prototype.isNotRestricted(context, function(err, result) {
        if (err) { return callback(err); }
        callback(null, !result);
    });
};

/**
 * Creates a new instance of AuthHandler class
 * @returns {RestrictHandler}
 */
RestrictHandler.createInstance = function() {
    return new RestrictHandler();
};

if (typeof exports !== 'undefined') {
    module.exports.createInstance = RestrictHandler.createInstance;
    module.exports.RestrictHandler = RestrictHandler;
}