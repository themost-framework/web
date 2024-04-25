/**
 * @license
 * MOST Web Framework 2.0 Codename Blueshift
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
var formidable = require('formidable');
var _ = require('lodash');
var LangUtils = require('@themost/common/utils').LangUtils;
var os = require('os');
// DEP0022: os.tmpDir()
// The os.tmpDir() API was deprecated in Node.js 7.0.0 and has since been removed. Please use os.tmpdir() instead.
// v14.0.0 end-of-life
// v7.0.0 deprecation
// Solution: map os.tmpDir() used by formidable to os.tmpdir()
/**
 * @type {{tmpDir(): string,tmpdir(): string}|*}
 */
var deprecatedOs = os;
if (typeof deprecatedOs.tmpDir === 'undefined' && typeof deprecatedOs.tmpdir === 'function') {
    Object.assign(os, {
        tmpDir: os.tmpdir
    });
}

/**
 * @class
 * @constructor
 * @implements BeginRequestHandler
 */
function MultipartHandler() {

}

MultipartHandler.prototype.beginRequest = function(context, callback) {
    var request = context.request;
    request.headers = request.headers || {};
    var contentType = request.headers['content-type'];
    if (/^multipart\/form-data/i.test(contentType)) {
        //use formidable to parse request data
        var f = new formidable.IncomingForm();
        return f.parse(request, function (err, form, files) {
            if (err) {
                callback(err);
                return;
            }
            try {
                // flatten form data
                var reqForm = Object.keys(form).filter(function(key) {
                    // return only keys that are not already in context.params
                    return Object.prototype.hasOwnProperty.call(context.params, key) === false;
                }).reduce(function (prev, key) {
                    // get first form key if it is an array with one element
                    if (Object.prototype.hasOwnProperty.call(form, key)) {
                        if (Array.isArray(form[key]) && form[key].length === 1) {
                            Object.assign(prev, { [key]: form[key][0] });
                        } else {
                            // otherwise assign the whole array
                            Object.assign(prev, { [key]: form[key] });
                        }
                    }
                    return prev;
                }, {});
                if (reqForm) {
                    // parse form data and assign it to context
                    Object.assign(context.params, LangUtils.parseForm(reqForm));
                }
                //add files
                if (files) {
                    const addParams = Object.keys(files).filter(function(key) {
                        return Object.prototype.hasOwnProperty.call(context.params, key) === false;
                    }).reduce(function (prev, key) {
                        if (Object.prototype.hasOwnProperty.call(files, key)) {
                            if (Array.isArray(files[key]) && files[key].length === 1) {
                                Object.assign(prev, { [key]: files[key][0] });
                            } else {
                                Object.assign(prev, { [key]: files[key] });
                            }
                        }
                        return prev;
                    }, {});
                    // assign context params
                    Object.assign(context.params, addParams);
                }
                return callback();
            }
            catch (error) {
                return callback(error);
            }
        });
    }
    else {
        callback();
    }
};

if (typeof exports !== 'undefined') {
    module.exports.MultipartHandler = MultipartHandler;
    module.exports.createInstance = function() { return  new MultipartHandler();  };
}
