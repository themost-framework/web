// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
/**
 * @class
 * @constructor
 */
function NoopHandler() {
    //
}

/**
 * @returns NoopHandler
 * */
NoopHandler.createInstance = function () {
    return new NoopHandler();
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports.NoopHandler = NoopHandler;
    /**
     * @returns {NoopHandler}
     */
    module.exports.createInstance = function() {
        return NoopHandler.createInstance();
    };
}