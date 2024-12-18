// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
var HttpError = require('@themost/common').HttpError;
var HttpMethodNotAllowedError = require('@themost/common').HttpMethodNotAllowedError;
var HttpNotFoundError = require('@themost/common').HttpNotFoundError;
var HttpForbiddenError = require('@themost/common').HttpForbiddenError;
var LangUtils = require('@themost/common').LangUtils;
var SequentialEventEmitter = require('@themost/common').SequentialEventEmitter;
var HtmlWriter = require('@themost/common').HtmlWriter;
var sprintf = require('sprintf').sprintf;
var _ = require('lodash');
var xml = require('@themost/xml');
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var Q = require('q');
var async = require('async');
var PassThrough = require('stream').PassThrough;
var ModuleLoaderStrategy = require('@themost/common').ModuleLoaderStrategy;
var Symbol = require('symbol');
var dataProperty = Symbol('data');

/**
 * @private
 * @param {Buffer} buffer
 */
function bufferToStream(buffer) {
    var stream = new PassThrough();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

/**
 * @class
 * @constructor
 */
function HttpResult() {
    this.contentType = 'text/html';
    this.contentEncoding = 'utf8';
}
/**
 * @deprecated This method is deprecated and it will be removed. Use HttpResult.status(number) method instead.
 * @description Sets the status of the HTTP response when this result will be executed
 * @param {Number=} status - A number which represents an HTTP status
 * @returns {HttpResult}
 *
 * @example
 *
 \@httpController()
 export default class HelloController extends HttpBaseController {

    constructor(context) {
        super(context);
    }

    \@httpGet()
    \@httpAction('index')
    getIndex() {
        return this.content('<h2>This action is not allowed.<h2>').status(403);
    }

}
 *
 */
HttpResult.prototype.statusCode = function(status) {
    this.responseStatus = status;
    return this;
};

/**
 * @description Sets the status of the HTTP response when this result will be executed
 * @param {Number=} status - A number which represents an HTTP status
 * @returns {HttpResult}
 *
 * @example
 *
 \@httpController()
 export default class HelloController extends HttpBaseController {

    constructor(context) {
        super(context);
    }

    \@httpGet()
    \@httpAction('index')
    getIndex() {
        return this.content('<h2>This action is not allowed.<h2>').status(403);
    }

}
 *
 */
HttpResult.prototype.status = function(status) {
    return this.statusCode(status)
};

/**
 * Executes an HttpResult instance against an existing HttpContext.
 * @param {HttpContext} context
 * @param {Function} callback
 * */
HttpResult.prototype.execute = function(context, callback) {
    callback = callback || function() {};
    try {
        var response = context.response;
        if (typeof this.data === 'undefined' || this.data === null) {
            response.writeHead(this.responseStatus || 204);
            return callback();
        }
        response.writeHead(this.responseStatus || 200, {"Content-Type": this.contentType});
       if (this.data) {
           if (this.contentEncoding === 'binary') {
               var source = bufferToStream(this.data);
               source.on('end', function() {
                   return callback();
               });
               source.on('error', function(err) {
                   return callback(err);
               });
               return source.pipe(response);
           }
           else {
               response.write(this.data, this.contentEncoding);
           }
       }
       return callback();
    }
    catch(err) {
        return callback(err);
    }
};
/**
 * @classdesc Represents a user-defined content that is a result of an action.
 * @class
 * @param {string|Buffer} content - A string or an instance of Buffer class which represents the action result.
 * @augments HttpResult
 *
 * @example

import HttpBaseController from '@themost/web/controllers/base';
import {httpController,httpGet, httpAction} from '@themost/web/decorators';
import {HttpContentResult} from "@themost/web/mvc";

 \@httpController()
 export default class HelloController extends HttpBaseController {

    constructor(context) {
        super(context);
    }

    \@httpGet()
    \@httpAction('index')
    getIndex() {
        return new HttpContentResult(`
        <h2>
            Hello World!
        </h2>
        `));
    }

}

 * @example

import HttpBaseController from '@themost/web/controllers/base';
import {httpController,httpGet, httpAction} from '@themost/web/decorators';
import {HttpContentResult} from "@themost/web/mvc";

 \@httpController()
 export default class HelloController extends HttpBaseController {

        constructor(context) {
            super(context);
        }

        \@httpGet()
        \@httpAction('index')
        getIndex() {
            return this.content(`
            <h2>
                Hello World!
            </h2>
            `));
        }

    }
 * */
function HttpContentResult(content) {

    var self = this;
    Object.defineProperty(this, 'data', {
       get: function() {
           return self[dataProperty];
       },
        set: function(value) {
            self[dataProperty] = value;
           if (value instanceof Buffer) {
               self.contentEncoding = 'binary';
           }
        },
        configurable: true,
        enumerable: false
    });
    //set default content type and encoding
    this.contentType = 'text/html';
    this.contentEncoding = 'utf8';
    this.data = content;
}
/**
 * Inherits HttpAction
 * */
LangUtils.inherits(HttpContentResult,HttpResult);

/**
 * Represents a content that does nothing.
 * @class
 * @constructor
 * @augments HttpResult
 */
function HttpEmptyResult() {
    //
}

/**
 * Inherits HttpAction
 * */
LangUtils.inherits(HttpEmptyResult,HttpResult);

HttpEmptyResult.prototype.execute = function(context, callback)
{
    //do nothing
    callback = callback || function() {};
    callback.call(context);
};
/**
 * @param {string} key
 * @param {*} value
 * @returns {*}
 * @private
 */
function _json_ignore_null_replacer(key, value) {
    if (value==null)
        return undefined;
    return value;
}

/**
 * @classdesc Represents the result an action that is used to send JSON-formatted content.
 * @class
 * @param {*} data - The data which is going to send when this result will be executed
 * @augments HttpResult
 * @constructor
 *
 * @example
 *

import HttpBaseController from '@themost/web/controllers/base';
import {httpController,httpGet, httpAction} from '@themost/web/decorators';
import {HttpJsonResult} from "@themost/web/mvc";

 \@httpController()
 export default class HelloController extends HttpBaseController {

    constructor(context) {
        super(context);
    }

    // GET /hello/index.json

    \@httpGet()
    \@httpAction('index')
    getIndex() {
        return this.json({
            "message": "Hello World"
        });
    }

}
 *
 @example

 //Send a JSON formatted error to client

import HttpBaseController from '@themost/web/controllers/base';
import {httpController,httpGet, httpAction} from '@themost/web/decorators';
import {HttpJsonResult} from "@themost/web/mvc";

 \@httpController()
 export default class HelloController extends HttpBaseController {

    constructor(context) {
        super(context);
    }

    \@httpGet()
    \@httpAction('index')
    getIndex() {
        return this.json({
            "code": "E401",
            "message": "You are not authorized to view data."
        }).status(401);
    }

}

 *
 */
function HttpJsonResult(data)
{
    if (data instanceof String) {
        this.data = data;
    }
    else if (data instanceof Error) {
        var keys = Object.getOwnPropertyNames(data);
        var thisData = {
            type: (data.constructor && data.constructor.name) || 'Error'
        };
        _.forEach(keys, function(key) {
            if (process.env.NODE_ENV !== 'development' && key==='stack') {
                return;
            }
            thisData[key] = data[key];
        });
        this.data = thisData;
    }
    else {
        this.data = data;
    }

    this.contentType = 'application/json;charset=utf-8';
    this.contentEncoding = 'utf8';
}
/**
 * Inherits HttpAction
 * */
LangUtils.inherits(HttpJsonResult,HttpResult);

/**
 * Executes an HttpResult instance against an existing HttpContext.
 * @param {HttpContext} context
 * @param {Function} callback
 * */
HttpJsonResult.prototype.execute = function(context, callback) {
    callback = callback || function() {};
    try {
        var response = context.response;
        if (typeof this.data === 'undefined' || this.data === null) {
            response.writeHead(204);
            return callback.call(context);
        }
        response.writeHead(this.responseStatus || 200, {"Content-Type": this.contentType});
        response.write(JSON.stringify(this.data, _json_ignore_null_replacer), this.contentEncoding);

        callback.call(context);
    }
    catch(e) {
        callback.call(context, e);
    }
};

/**
 * Represents an action that is used to send Javascript-formatted content.
 * @class
 * @param {*} data
 * @constructor
 * @augments HttpResult
 */
function HttpJavascriptResult(data)
{
    if (typeof data === 'string')
        this.data = data;
    this.contentType = 'text/javascript;charset=utf-8';
    this.contentEncoding = 'utf8';
}
/**
 * Inherits HttpAction
 * */
LangUtils.inherits(HttpJavascriptResult,HttpResult);


/**
 * Represents an action that is used to send XML-formatted content.
 * @class
 * @param data
 * @constructor
 * @augments HttpResult
 */
function HttpXmlResult(data)
{

    this.contentType = 'text/xml';
    this.contentEncoding = 'utf8';
    if (typeof data === 'undefined' || data == null)
        return;
    this.data = data;

}

/**
 * Inherits HttpAction
 * */
LangUtils.inherits(HttpXmlResult,HttpResult);

/**
 * Executes an HttpResult instance against an existing HttpContext.
 * @param {HttpContext} context
 * @param {Function} callback
 * */
HttpXmlResult.prototype.execute = function(context, callback) {
    callback = callback || function() {};
    try {
        var response = context.response;
        if (typeof this.data === 'undefined' || this.data === null) {
            response.writeHead(204);
            return callback.call(context);
        }
        response.writeHead(this.responseStatus || 200, {"Content-Type": this.contentType});
        if (typeof this.data === 'object') {
            response.write(xml.serialize(this.data, { item:'Item' }).outerXML(), this.contentEncoding);
        }
        else {
            response.write(this.data, this.contentEncoding);
        }
        callback.call(context);
    }
    catch(e) {
        callback.call(context, e);
    }
};

/**
 * Represents a redirect action to a specified URI.
 * @class
 * @param {string|*} url
 * @constructor
 * @augments HttpResult
 */
function HttpRedirectResult(url) {
    this.url = url;
}

/**
 * Inherits HttpAction
 * */
LangUtils.inherits(HttpRedirectResult,HttpResult);
/**
 *
 * @param {HttpContext} context
 * @param {Function} callback
 */
HttpRedirectResult.prototype.execute = function(context, callback)
{
    /**
     * @type ServerResponse
     * */
    var response = context.response;
    response.writeHead(302, { 'Location': this.url });
    //response.end();
    callback.call(context);
};

/**
 * Represents a static file result
 * @class
 * @param {string} physicalPath
 * @param {string=} fileName
 * @constructor
 * @augments HttpResult
 */
function HttpFileResult(physicalPath, fileName) {
    //
    this.physicalPath = physicalPath;
    this.fileName = fileName;
}

/**
 * Inherits HttpAction
 * */
LangUtils.inherits(HttpFileResult,HttpResult);
/**
 *
 * @param {HttpContext} context
 * @param {Function} callback
 */
HttpFileResult.prototype.execute = function(context, callback)
{
    callback = callback || function() {};
    var physicalPath = this.physicalPath, fileName = this.fileName;
    fs.exists(physicalPath, function(exists) {
        if (!exists) {
            callback(new HttpNotFoundError());
        }
        else {
            try {
                fs.stat(physicalPath, function (err, stats) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        if (!stats.isFile()) {
                            callback(new HttpNotFoundError());
                        }
                        else {
                            //get if-none-match header
                            var requestETag = context.request.headers['if-none-match'];
                            //generate responseETag
                            var md5 = crypto.createHash('md5');
                            md5.update(stats.mtime.toString());
                            var responseETag = md5.digest('base64');
                            if (requestETag) {
                                if (requestETag === responseETag) {
                                    context.response.writeHead(304);
                                    context.response.end();
                                    callback();
                                    return;
                                }
                            }
                            var contentType = null;
                            //get file extension
                            var extensionName = path.extname(fileName || physicalPath);
                            //get MIME collection
                            var mimes = context.getApplication().getConfiguration().mimes;
                            var contentEncoding = null;
                            //find MIME type by extension
                            var mime = mimes.filter(function (x) {
                                return x.extension === extensionName;
                            })[0];
                            if (mime) {
                                contentType = mime.type;
                                if (mime.encoding)
                                    contentEncoding = mime.encoding;
                            }

                            //throw exception (MIME not found or access denied)
                            if (_.isNil(contentType)) {
                                callback(new HttpForbiddenError())
                            }
                            else {
                                /*//finally process request
                                fs.readFile(physicalPath, 'binary', function (err, data) {
                                    if (err) {
                                        callback(e);
                                    }
                                    else {
                                        //add Content-Disposition: attachment; filename="<file name.ext>"
                                        context.response.writeHead(200, {
                                            'Content-Type': contentType + (contentEncoding ? ';charset=' + contentEncoding : ''),
                                            'ETag': responseETag
                                        });
                                        context.response.write(data, "binary");
                                        callback();
                                    }
                                });*/
                                //create read stream
                                var source = fs.createReadStream(physicalPath);
                                //add Content-Disposition: attachment; filename="<file name.ext>"
                                context.response.writeHead(200, {
                                    'Content-Type': contentType + (contentEncoding ? ';charset=' + contentEncoding : ''),
                                    'ETag': responseETag
                                });
                                //copy file
                                source.pipe(context.response);
                                source.on('end', function() {
                                    callback();
                                });
                                source.on('error', function(err) {
                                    callback(err);
                                });
                            }
                        }
                    }
                });
            }
            catch (e) {
                callback(e);
            }
        }
    });

};
/**
 * @param controller
 * @param view
 * @param extension
 * @param callback
 * @returns {*}
 * @private
 */
function queryDefaultViewPath(controller, view, extension, callback) {
   return queryAbsoluteViewPath.call(this, this.application.mapPath('/views'), controller, view, extension, callback);
}
/**
 * @param view
 * @param extension
 * @param callback
 * @returns {*}
 * @private
 */
function querySharedViewPath(view, extension, callback) {
    return queryAbsoluteViewPath.call(this, this.application.mapPath('/views'), 'shared', view, extension, callback);
}

/**
 * @param search
 * @param controller
 * @param view
 * @param extension
 * @param callback
 * @private
 */
function queryAbsoluteViewPath(search, controller, view, extension, callback) {
    var result = path.resolve(search, sprintf('%s/%s.html.%s', controller, view, extension));
    fs.exists(result, function(exists) {
        if (exists)
            return callback(null, result);
        //search for capitalized controller name e.g. person as Person
        var capitalizedController = controller.charAt(0).toUpperCase() + controller.substring(1);
        result = path.resolve(search, sprintf('%s/%s.html.%s', capitalizedController, view, extension));
        fs.exists(result, function(exists) {
            if (exists)
                return callback(null, result);
            callback();
        });
    });
}
/**
 * @param {string} p
 * @returns {boolean}
 * @private
 */
function isAbsolute(p) {
    return path.normalize(p + '/') === path.normalize(path.resolve(p) + '/');
}

/**
 * Represents a class that is used to render a view.
 * @class
 * @param {*=} name - The name of the view.
 * @param {*=} data - The data that are going to be used to render the view.
 * @augments HttpResult
 */
function HttpViewResult(name, data)
{
    this.name = name;
    this.data = data===undefined? []: data;
    this.contentType = 'text/html;charset=utf-8';
    this.contentEncoding = 'utf8';
}
/**
 * Inherits HttpAction
 * */
LangUtils.inherits(HttpViewResult,HttpResult);

/**
 * Resolves view physical path based on the given view engine
 * @param {HttpContext} context - An instance of HttpContext class which represents the underlying context
 * @param {string} controller - A string which represents the name of the controller we want to search for
 * @param {string} view - A string which represents the name of the view we want to search for
 * @param {HttpViewEngineConfiguration} engine - The configuration of the target view engine
 * @param {Function} callback
 */
HttpViewResult.resolveViewPath = function(context, controller, view, engine, callback) {
    return queryDefaultViewPath.call(context, controller, view, engine.extension, function(err, result) {
        if (err) { return callback(err); }
        if (result) {
            return callback(null, result);
        }
        else {
            return querySharedViewPath.call(context, view, engine.extension, function(err, result) {
                if (err) { return callback(err); }
                if (result) {
                    return callback(null, result);
                }
                callback();
            });
        }
    });
};

/**
 * Sets or changes the name of this HttpViewResult instance.
 * @param {string} s
 * @returns {HttpViewResult}
 */
HttpViewResult.prototype.setName = function(s) {
    this.name = s;
    return this;
};

/**
 * @param {function(Error=,*=)} callback
 * @param {HttpContext} context - The HTTP context
 * */
HttpViewResult.prototype.execute = function(context, callback)
{
    var self = this;
    callback = callback || function() {};
    /**
     * @type ServerResponse
     * */
    var response = context.response;
    //if the name is not defined get the action name of the current controller
    if (!this.name)
        //get action name
        this.name = context.data['action'];
    //validate [path] route param in order to load a view that is located in a views' sub-directory (or in another absolute path)
    var routePath;
    if (context.request.route) {
        routePath =  context.request.route.path;
    }
    //get view name
    var viewName = this.name;
    if (/^partial/.test(viewName)) {
        //partial view
        viewName = viewName.substr(7).replace(/^-/,'');
        context.request.route.partial = true;
    }

    //and of course controller's name
    var controllerName = context.data['controller'];
    //enumerate existing view engines e.g /views/controller/index.[html].ejs or /views/controller/index.[html].xform etc.
    var viewPath, viewEngine;
    async.eachSeries(context.getApplication().getConfiguration().engines, function(engine, cb) {
        if (viewPath) { cb(); return; }
        if (routePath && isAbsolute(routePath)) {
            queryAbsoluteViewPath.call(context, routePath, controllerName, viewName, engine.extension, function(err, result) {
                if (err) { return cb(err); }
                if (result) {
                    viewPath = result;
                    viewEngine = engine;
                    return cb();
                }
                else {
                    return cb();
                }
            });
        }
        else {
            var searchViewName = viewName;
            if (routePath) {
                searchViewName = path.join(routePath, viewName);
            }
            //search by relative path
            queryDefaultViewPath.call(context, controllerName, searchViewName, engine.extension, function(err, result) {
                if (err) { return cb(err); }
                if (result) {
                    viewPath = result;
                    viewEngine = engine;
                    return cb();
                }
                else {
                    querySharedViewPath.call(context, searchViewName, engine.extension, function(err, result) {
                        if (err) { return cb(err); }
                        if (result) {
                            viewPath = result;
                            viewEngine = engine;
                            return cb();
                        }
                        cb();
                    });
                }
            });
        }

    }, function(err) {
        if (err) {
            return callback(err);
        }
        if (viewEngine) {
            var moduleLoader = context.getApplication().getConfiguration().getStrategy(ModuleLoaderStrategy);
            return Q.promise(function(resolve, reject) {
                var engine;
                if (/^@themost\/web\//.test(viewEngine.type)) {
                    engine = require(viewEngine.type.replace(/^@themost\/web\//,"./"));
                }
                else {
                    engine = _.isObject(moduleLoader) ? moduleLoader.require(viewEngine.type) : require(viewEngine.type);
                }
                /**
                 * @type {HttpViewEngine|*}
                 */
                var engineInstance = engine.createInstance(context);
                //render
                var event = { context:context, target:self };
                return context.emit('preExecuteResult', event, function(err) {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        engineInstance.render(viewPath, self.data, function(err, result) {
                            if (err) {
                                return reject(err);
                            }
                            else {
                                //HttpViewResult.result or data (?)
                                self.result = result;
                                return context.emit('postExecuteResult', event, function(err) {
                                    if (err) {
                                        return reject(err);
                                    }
                                    else {
                                        response.writeHead(self.responseStatus || 200, {"Content-Type": self.contentType});
                                        response.write(self.result, self.contentEncoding);
                                        return resolve();
                                    }
                                });
                            }
                        });
                    }
                });
            }).then(function() {
                return callback();
            }).catch(function(err) {
               return callback(err);
            });

        }
        else {
            var error = new HttpNotFoundError();
            if (context.request && context.request.url) {
                error.resource = context.request.url;
            }
            return callback(error);
        }
    });




};


/**
 * @class
 * @classdesc Provides methods that respond to HTTP requests that are made to a web application
 * @constructor
 * @param {HttpContext} context - The executing HTTP context.
 * */
function HttpController(context) {
    /**
     * @name HttpController#context
     * @type {HttpContext}
     */
    this.context = context;
}

/**
 * Creates a view result object for the given request.
 * @param {*=} data
 * @returns {HttpViewResult}
 */
HttpController.prototype.view = function(data)
{
    return new HttpViewResult(null, data);
};

/**
 * Creates a view result based on the context content type
 * @param {*=} data
 * @returns HttpViewResult
 * */
HttpController.prototype.result = function(data)
{
    if (this.context) {
         var fn = this[this.context.format];
        if (typeof fn !== 'function')
            throw new HttpError(400,'Not implemented.');
        return fn.call(this, data);
    }
    else
        throw new Error('Http context cannot be empty at this context.');
};

HttpController.prototype.forbidden = function (callback) {
    return callback(new HttpForbiddenError());
};

/**
 * Creates a view result object for the given request.
 * @param {*=} data
 * @returns HttpViewResult
 * */
HttpController.prototype.html = function(data)
{
    return new HttpViewResult(null, data);
};
/**
 * Creates a view result object for the given request.
 * @param {*=} data
 * @returns HttpViewResult
 * */
HttpController.prototype.htm = HttpController.prototype.html;

/**
 * Creates a view result object for the given request.
 * @param {String=} data
 * @returns HttpJavascriptResult
 * */
HttpController.prototype.js = function(data)
{
    return new HttpJavascriptResult(data);
};

/**
 * Creates a view result object that represents a client javascript object.
 * This result may be used for sharing specific objects stored in memory or server filesystem
 * e.g. serve a *.json file as a client variable with name window.myVar1 or
 * serve user settings object ({ culture: 'en-US', notifyMe: false}) as a variable with name window.settings
 * @param {String} name
 * @param {String|*} obj
 * @returns HttpResult
 * */
HttpController.prototype.jsvar = function(name, obj)
{
    if (typeof name !== 'string')
        return new HttpEmptyResult();
    if (name.length===0)
        return new HttpEmptyResult();
    if (typeof obj === 'undefined' || obj === null)
        return new HttpJavascriptResult(name.concat(' = null;'));
    else if (obj instanceof Date)
        return new HttpJavascriptResult(name.concat(' = new Date(', obj.valueOf(), ');'));
    else if (typeof obj === 'string')
        return new HttpJavascriptResult(name.concat(' = ', obj, ';'));
    else
        return new HttpJavascriptResult(name.concat(' = ', JSON.stringify(obj), ';'));
};

/**
 * Invokes a default action and returns an HttpViewResult instance
 * @param {Function} callback
 */
HttpController.prototype.action = function(callback)
{
    var self = this;
    self.context.handleGet(function() {
        return callback(null, self.view());
    }).unhandle(function() {
        return callback(new HttpMethodNotAllowedError());
    });

};

/**
 * Creates a content result object by using a string.
 * @returns HttpContentResult
 * */
HttpController.prototype.content = function(content)
{
     return new HttpContentResult(content);
};
/**
 * Creates a JSON result object by using the specified data.
 * @returns HttpJsonResult
 * */
HttpController.prototype.json = function(data)
{
    return new HttpJsonResult(data);
};

/**
 * Creates a XML result object by using the specified data.
 * @returns HttpXmlResult
 * */
HttpController.prototype.xml = function(data)
{
    return new HttpXmlResult(data);
};

/**
 * Creates a binary file result object by using the specified path.
 * @param {string}  physicalPath
 * @param {string=}  fileName
 * @returns {HttpFileResult|HttpResult}
 * */
HttpController.prototype.file = function(physicalPath, fileName)
{
    return new HttpFileResult(physicalPath, fileName);
};

/**
 * Creates a redirect result object that redirects to the specified URL.
 * @returns HttpRedirectResult
 * */
HttpController.prototype.redirect = function(url)
{
    return new HttpRedirectResult(url);
};

/**
 * Creates an empty result object.
 * @returns HttpEmptyResult
 * */
HttpController.prototype.empty = function()
{
    return new HttpEmptyResult();
};

/**
 * Creates an http next result.
 * @returns HttpNextResult
 * */
HttpController.prototype.next = function()
{
    return new HttpNextResult();
};

/**
 * Promise resolver function
 * @callback PromiseResolverFunction
 * @param {Function} resolve
 * @param {Function=} reject
 * @param {Function=} notify
 */

/**
 * Returns a promise by executing the given resolver function
 * @param {PromiseResolverFunction} resolver
 * @returns {Promise|*}
 * */
HttpController.prototype.toPromise = function(resolver)
{
    return Q.promise(resolver.bind(this));
};

/**
 * Encapsulates information that is related to rendering a view.
 * @class
 * @param {HttpContext} context
 * @property {DataModel} model
 * @property {HtmlViewHelper} html
 * @constructor
 * @augments {SequentialEventEmitter}
 */
function HttpViewContext(context) {
    /**
     * Gets or sets the body of the current view
     * @type {String}
     */
    this.body='';
    /**
     * Gets or sets the title of the page if the view will be fully rendered
     * @type {String}
     */
    this.title='';
    /**
     * Gets or sets the view layout page if the view will be fully rendered
     * @type {String}
     */
    this.layout = null;
    /**
     * Gets or sets the view data
     * @type {String}
     */
    this.data = null;
    /**
     * Represents the current HTTP context
     * @type {HttpContext}
     */
    this.context = context;

    /**
     * @name HttpViewContext#writer
     * @type HtmlWriter
     * @description Gets an instance of HtmlWriter helper class
     */
    var writer;
    Object.defineProperty(this, 'writer', {
        get:function() {
            if (writer)
                return writer;
            writer = new HtmlWriter();
            writer.indent = false;
            return writer;
        }, configurable:false, enumerable:false
    });

    var self = this;
    Object.defineProperty(this, 'model', {
        get:function() {
            if (self.context.params)
                if (self.context.params.controller)
                    return self.context.model(self.context.params.controller);
            return null;
        }, configurable:false, enumerable:false
    });

    //class extension initiators
    if (typeof this.init === 'function') {
        //call init() method
        this.init();
    }
}
LangUtils.inherits(HttpViewContext, SequentialEventEmitter);
/**
 * @param {string} url
 * @param {Function} callback
 * @returns {string}
 */
HttpViewContext.prototype.render = function(url, callback) {
    callback = callback || function() {};
    //get response cookie, if any
    var requestCookie = this.context.response.getHeader('set-cookie');
    if (typeof this.context.request.headers.cookie !== 'undefined')
        requestCookie = this.context.request.headers.cookie;
    this.context.getApplication().executeRequest( { url: url, cookie: requestCookie }, function(err, result) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, result.body);
        }
    });
};

HttpViewContext.prototype.init = function() {
    //
};

/**
 *
 * @param {String} s
 * @param {String=} lib
 * @returns {String}
 */
HttpViewContext.prototype.translate = function(s, lib) {
    return this.context.translate(s, lib);
};

/**
 * Initializes an action to continue request processing.
 * @class
 * @constructor
 * @augments HttpResult
 */
function HttpNextResult()
{
    //
}
LangUtils.inherits(HttpNextResult, HttpResult);

if (typeof exports !== 'undefined')
{
    module.exports.HttpResult  = HttpResult;
    module.exports.HttpContentResult  = HttpContentResult;
    module.exports.HttpJsonResult =HttpJsonResult;
    module.exports.HttpJavascriptResult =HttpJavascriptResult;
    module.exports.HttpEmptyResult =HttpEmptyResult;
    module.exports.HttpXmlResult =HttpXmlResult;
    module.exports.HttpRedirectResult =HttpRedirectResult;
    module.exports.HttpFileResult =HttpFileResult;
    module.exports.HttpViewResult =HttpViewResult;
    module.exports.HttpViewContext =HttpViewContext;
    module.exports.HttpController =HttpController;
    module.exports.HttpNextResult  = HttpNextResult;
}



