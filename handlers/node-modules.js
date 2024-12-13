// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
var StaticHandler = require("./static").StaticHandler;
var LangUtils = require('@themost/common').LangUtils;
var fs = require("fs");
var url = require("url");
var path = require("path");

/**
 * @class
 * @constructor
 * @inherits StaticHandler
 */
function NodeModulesHandler() {
    NodeModulesHandler.super_.bind(this)();
}

LangUtils.inherits(NodeModulesHandler, StaticHandler);

NodeModulesHandler.prototype.mapRequest = function(context, callback) {
    callback = callback || function() {};
    try {
        //get file path
        var uri = url.parse(context.request.url);
        if (!/^\/node_modules\//i.test(uri.pathname)) {
            return callback();
        }
        var p = path.join(process.cwd(), uri.pathname);
        fs.stat(p, function(err, stats) {
            if (err) {
                //requested file does not exists
                if (err.code === "ENOENT") { return callback(); }
                return callback(err);
            }
            else {
                //if file exists
                if (stats && stats.isFile()) {
                    //set request current handler
                    context.request.currentHandler = new NodeModulesHandler();
                    //set current execution path
                    context.request.currentExecutionPath = p;
                    //set file stats
                    context.request.currentExecutionFileStats = stats;
                }
                callback(null);
            }
        });
    } catch (e) {
        callback(e);
    }
};

if (typeof exports !== 'undefined') {
    module.exports = {
        NodeModulesHandler:NodeModulesHandler,
        createInstance : function() {
            return new NodeModulesHandler();
        }
    };
}