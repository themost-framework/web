// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
var fs = require('fs');
var pagedown = require('pagedown');
var Extra = require('./pagedown/pagedown-extra').Extra;
var LangUtils = require('@themost/common').LangUtils;
var ArgumentError = require('@themost/common').ArgumentError;
var HttpViewEngine = require('../types').HttpViewEngine;
/**
 * @class
 * @param {HttpContext=} context
 * @constructor
 * @augments {HttpViewEngine}
 */
function MarkdownEngine(context) {
    MarkdownEngine.super_.bind(this)(context);
}
LangUtils.inherits(MarkdownEngine,HttpViewEngine);
/**
 * @param {string} file
 * @param {*} data
 * @param {Function} callback
 */
MarkdownEngine.prototype.render = function(file, data, callback) {
    callback = callback || function () {};
    try {
        if (typeof file !== 'string') {
            return callback(new ArgumentError("Markdown template URI must be a string."));
        }
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) {
                return callback(err);
            }
            try {
                /**
                 * @type {Markdown.Converter|*}
                 */
                var converter = new pagedown.Converter();
                Extra.init(converter);
                var result = converter.makeHtml(data);
                //return the converted HTML markup
                return callback(null, result);
            } catch (err) {
                return callback(err);
            }
        });
    } catch (err) {
        return callback(err);
    }
};
/**
 * @static
 * @param  {HttpContext=} context
 * @returns {MarkdownEngine}
 */
MarkdownEngine.createInstance = function(context) {
    return new MarkdownEngine(context);
};

if (typeof exports !== 'undefined') {
    module.exports.MarkdownEngine = MarkdownEngine;
    /**
     * @param {HttpContext=} context
     * @returns {MarkdownEngine}
     */
    module.exports.createInstance = function(context) {
        return MarkdownEngine.createInstance(context);
    };
}