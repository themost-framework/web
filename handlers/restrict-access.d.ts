// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
import {AuthorizeRequestHandler} from "../types";
import {HttpContext} from "../context";

export declare class RestrictAccess implements AuthorizeRequestHandler {
    authorizeRequest(context: HttpContext, callback: (err?: Error) => void);
    isRestricted(context: HttpContext, callback: (err?: Error, res?: boolean) => void)
    isNotRestricted(context: HttpContext, callback: (err?: Error, res?: boolean) => void)
}

export declare function createInstance(): RestrictAccess;
