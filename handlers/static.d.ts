// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
import {MapRequestHandler, PostMapRequestHandler, ProcessRequestHandler, ValidateRequestHandler} from "../types";
import {HttpContext} from "../context";

export declare class StaticHandler implements ValidateRequestHandler,
    MapRequestHandler,
    PostMapRequestHandler,
    ProcessRequestHandler {
    mapRequest(context: HttpContext, callback: (err?: Error) => void);

    postMapRequest(context: HttpContext, callback: (err?: Error) => void);

    processRequest(context: HttpContext, callback: (err?: Error) => void);

    validateRequest(context: HttpContext, callback: (err?: Error) => void);

}

export declare function createInstance(): StaticHandler;
