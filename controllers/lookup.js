// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
var HttpDataController = require('./data');
var LangUtils = require("@themost/common/utils").LangUtils;
/**
 * @classdesc HttpLookupController class describes a lookup model data controller.
 * @class
 * @constructor
 * @param {HttpContext} context
 * @augments HttpController
 */
function HttpLookupController(context) {
    HttpLookupController.super_.bind(this)(context);
}

LangUtils.inherits(HttpLookupController, HttpDataController);

if (typeof module !== 'undefined') {
    module.exports = HttpLookupController;
}