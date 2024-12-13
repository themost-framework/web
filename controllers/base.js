// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
var LangUtils = require('@themost/common').LangUtils;
var HttpController = require('../mvc').HttpController;
/**
 * @classdesc HttpBaseController class describes a base controller.
 * @class
 * @constructor
 * @param {HttpContext} context
 * @augments HttpController
 */
function HttpBaseController(context) {
    HttpBaseController.super_.bind(this)(context);
}
LangUtils.inherits(HttpBaseController, HttpController);

if (typeof module !== 'undefined') {
    module.exports = HttpBaseController;
}