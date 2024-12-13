// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
var _  = require('lodash');
var querystring = require('querystring');
/**
 * Provides a case insensitive attribute getter
 * @param name
 * @returns {*}
 * @private
 */
function caseInsensitiveAttribute(name) {
    if (typeof name === 'string') {
        if (this[name])
            return this[name];
        //otherwise make a case insensitive search
        var re = new RegExp('^' + name + '$','i');
        var p = Object.keys(this).filter(function(x) { return re.test(x); })[0];
        if (p)
            return this[p];
    }
}

function caseInsensitiveHasAttribute(name) {
    if (typeof name === 'string') {
        if (this[name])
            return true;
        //otherwise make a case insensitive search
        var re = new RegExp('^' + name + '$','i');
        var p = Object.keys(this).filter(function(x) { return re.test(x); })[0];
        if (p)
            return true;
    }
    return false;
}

/**
 * @class
 * @constructor
 * @implements BeginRequestHandler
 */
function QuerystringHandler() {
    //
}

QuerystringHandler.prototype.beginRequest = function(context, callback) {
    context = context || {};
    callback = callback || function() {};
    var request = context.request;
    if (typeof request === 'undefined') {
        callback();
        return;
    }
    try {
        context.params = context.params || {};
        //apply case insensitivity search in params object
        context.params.attr = caseInsensitiveAttribute;
        context.params.hasAttr = caseInsensitiveHasAttribute;
        // set default query params
        request.query = { };
        //add query string params
        if (request.url.indexOf('?') > 0) {
            // set request query
            request.query = querystring.parse(request.url.substring(request.url.indexOf('?') + 1));
            /**
             * @name ClientRequest#query
             * @description Gets or sets an object which represents the query string of an HTTP request
             * @type *
             */ 
            // extend context.params
            _.assign(context.params, request.query);
        }
        callback();
    }
    catch(e) {
        callback(e);
    }
};

if (typeof exports !== 'undefined') {
    module.exports.QuerystringHandler = QuerystringHandler;
    module.exports.createInstance = function() { return  new QuerystringHandler();  };
}