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
var TraceUtils = require('@themost/common/utils').TraceUtils;
var os = require('os');
// DEP0022: os.tmpDir()
// The os.tmpDir() API was deprecated in Node.js 7.0.0 and has since been removed. Please use os.tmpdir() instead.
// v14.0.0 end-of-life
// v7.0.0 deprecation
// Solution: map os.tmpDir() used by formidable to os.tmpdir()
if (typeof os.tmpDir === 'undefined' && typeof os.tmpdir === 'function') {
    os.tmpDir = os.tmpdir;
}
/**
 * @class UnknownValue
 * @constructor
 */
function UnknownValue() {
    //
}

UnknownValue.prototype.valueOf = function() { return null; };

UnknownValue.prototype.toJSON = function() { return null; };

UnknownValue.DateTimeRegex = /^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])(?:[T ](\d+):(\d+)(?::(\d+)(?:\.(\d+))?)?)?(?:Z(-?\d*))?([+-](\d+):(\d+))?$/;
UnknownValue.BooleanTrueRegex = /^true$/i;
UnknownValue.BooleanFalseRegex = /^false$/i;
UnknownValue.NullRegex = /^null$/i;
UnknownValue.UndefinedRegex = /^undefined$/i;
UnknownValue.IntegerRegex =/^[-+]?\d+$/;
UnknownValue.FloatRegex =/^[+-]?\d+(\.\d+)?$/;
/**
 * @class UnknownPropertyDescriptor
 * @constructor
 */
function UnknownPropertyDescriptor(obj, name) {
    Object.defineProperty(this, 'value', { configurable:false, enumerable:true, get: function() { return obj[name]; }, set: function(value) { obj[name]=value; } });
    Object.defineProperty(this, 'name', { configurable:false, enumerable:true, get: function() { return name; } });
}
/**
 * @param {string} value
 */
UnknownValue.convert = function(value) {
    var result;
    if ((typeof value === 'string'))
    {
        if (value.length===0) {
            result = value
        }
        if (value.match(UnknownValue.BooleanTrueRegex)) {
            result = true;
        }
        else if (value.match(UnknownValue.BooleanFalseRegex)) {
            result = false;
        }
        else if (value.match(UnknownValue.NullRegex) || value.match(UnknownValue.UndefinedRegex)) {
            result = null;
        }
        else if (value.match(UnknownValue.IntegerRegex)) {
            result = parseInt(value);
        }
        else if (value.match(UnknownValue.FloatRegex)) {
            result = parseFloat(value);
        }
        else if (value.match(UnknownValue.DateTimeRegex)) {
            result = new Date(Date.parse(value));
        }
        else {
            result = value;
        }
    }
    else {
        result = value;
    }
    return result;
};



/**
 * @class PostHandler
 * @constructor
 * @implements BeginRequestHandler
 */
function PostHandler() {

}

/**
 *
 * @param {*} origin
 * @param {string} expr
 * @param {string} value
 * @param {*=} options
 * @returns {*}
 * @private
 */
function extend(origin, expr, value, options) {

    options = options || { convertValues:false };
    //find base notation
    var match = /(^\w+)\[/.exec(expr), name, descriptor, expr1;
    if (match) {
        //get property name
        name = match[1];
        //validate array property
        if (/^\d+$/g.test(name)) {
            //property is an array
            if (!_.isArray(origin.value))
                origin.value = [];
            // get new expression
            expr1 = expr.substr(match.index + match[1].length);
            extend(origin, expr1, value, options);
        }
        else {
            //set property value (unknown)
            origin[name] = origin[name] || new UnknownValue();
            descriptor = new UnknownPropertyDescriptor(origin, name);
            // get new expression
            expr1 = expr.substr(match.index + match[1].length);
            extend(descriptor, expr1, value, options);
        }
    }
    else if (expr.indexOf('[')===0) {
        //get property
        var re = /\[(.*?)\]/g;
        match = re.exec(expr);
        if (match) {
            name = match[1];
            // get new expression
            expr1 = expr.substr(match.index + match[0].length);
            if (/^\d+$/g.test(name)) {
                //property is an array
                if (!_.isArray(origin.value))
                    origin.value = [];
            }
            if (expr1.length===0) {
                if (origin.value instanceof UnknownValue) {
                    origin.value = {};
                }
                var typedValue;
                //convert string value
                if ((typeof value === 'string') && options.convertValues) {
                    typedValue = UnknownValue.convert(value);
                }
                else {
                    typedValue = value;
                }
                if (_.isArray(origin.value))
                    origin.value.push(typedValue);
                else
                    origin.value[name] = typedValue;
            }
            else {
                if (origin.value instanceof UnknownValue) {
                    origin.value = { };
                }
                origin.value[name] = origin.value[name] || new UnknownValue();
                descriptor = new UnknownPropertyDescriptor(origin.value, name);
                extend(descriptor, expr1, value, options);
            }
        }
        else {
            throw new Error('Invalid object property notation. Expected [name]');
        }
    }
    else if (/^[\w-]*$/.test(expr)) {
        if (options.convertValues)
            origin[expr] = UnknownValue.convert(value);
        else
            origin[expr] = value;
    }
    else {
        throw new Error('Invalid object property notation. Expected property[name] or [name]');
    }
    return origin;
}

/**
 * Parses a form object and returns form parameters as object e.g. user[name]=user&user1[password]=1234 returns user: { name: 'user1', password:'1234'}
 * @param form
 * @private
 */
function parseForm(form) {
    var result = {};
    if (typeof form === 'undefined' || form===null)
        return result;
    var keys = Object.keys(form);
    keys.forEach(function(key) {
        if (form.hasOwnProperty(key))
        {
            extend(result, key, form[key]);
        }
    });
    return result;
}

PostHandler.prototype.beginRequest = function(context, callback) {
    try {
        var request = context.request;
        //extend params object (parse form data)
        if (typeof request.socket === 'undefined') {
            callback();
        }
        else {
            request.headers = request.headers || {};
            if (/^application\/x-www-form-urlencoded/i.test(request.headers['content-type'])) {
                //use formidable to parse request data
                var f = new formidable.IncomingForm();
                return f.parse(request, function (err, form, files) {
                    if (err) {
                        return callback(err);
                    }
                    try {
                        // flatten form data
                        var reqForm = Object.keys(form).filter(function (key) {
                            // important: return only keys that are not already in context.params
                            return Object.prototype.hasOwnProperty.call(context.params, key) === false;
                        }).reduce(function (prev, key) {
                            if (Object.prototype.hasOwnProperty.call(form, key)) {
                                var value = form[key];
                                if (Array.isArray(value) && value.length === 1) {
                                    Object.assign(prev, { [key]: value[0] });
                                } else {
                                    Object.assign(prev, { [key]: value });
                                }
                            }
                            return prev;
                        }, {});
                        if (reqForm) {
                            Object.assign(context.params, parseForm(reqForm));
                        }
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

        }
    }
    catch  (err) {
        TraceUtils.log(err);
        callback(new Error("An internal server error occurred while parsing request data."));
    }

};

if (typeof exports !== 'undefined') {
    exports.UnknownValue = UnknownValue;
    exports.PostHandler = PostHandler;
    exports.createInstance = function() {
        return new PostHandler();
    };
}
