// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
var HttpController = require('../mvc').HttpController;
/**
 * @classdesc HttpBaseController class describes a base controller.
 * @augments HttpController
 */
class HttpBaseController extends HttpController {
    /**
     * @param {HttpContext} context
     */
    constructor(context) {
        super(context);
    }
}

if (typeof module !== 'undefined') {
    module.exports = HttpBaseController;
}
