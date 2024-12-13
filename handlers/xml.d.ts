// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
import {BeginRequestHandler, ValidateRequestHandler} from "../types";
import {HttpContext} from "../context";

export declare class XmlHandler implements ValidateRequestHandler, BeginRequestHandler {
    beginRequest(context: HttpContext, callback: (err?: Error) => void);

    validateRequest(context: HttpContext, callback: (err?: Error) => void);

}

export declare function createInstance(): XmlHandler;
