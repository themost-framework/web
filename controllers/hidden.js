// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
var HttpController = require("../mvc").HttpController;
var LangUtils = require("@themost/common/utils").LangUtils;
/**
 * @class
 * @constructor
 * @param {HttpContext} context
 * @augments HttpController
 */
function HttpHiddenController(context)
{
    HttpHiddenController.super_.bind(this)(context);
}
LangUtils.inherits(HttpHiddenController, HttpController);

if (typeof module !== 'undefined') {
    module.exports = HttpHiddenController;
}