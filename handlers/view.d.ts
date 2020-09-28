// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved
import {AuthorizeRequestHandler, MapRequestHandler, PostMapRequestHandler, ProcessRequestHandler} from "../types";
import {HttpContext} from "../context";

export declare class ViewHandler implements AuthorizeRequestHandler, MapRequestHandler, PostMapRequestHandler, ProcessRequestHandler {
    mapRequest(context: HttpContext, callback: (err?: Error) => void);

    postMapRequest(context: HttpContext, callback: (err?: Error) => void);

    processRequest(context: HttpContext, callback: (err?: Error) => void);

    authorizeRequest(context: HttpContext, callback: (err?: Error) => void);

}

export declare function createInstance(): ViewHandler;
