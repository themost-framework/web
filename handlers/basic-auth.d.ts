// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved
import {AuthenticateRequestHandler} from "../types";
import {HttpContext} from "../context";

export declare class BasicAuthHandler implements AuthenticateRequestHandler {
    authenticateRequest(context: HttpContext, callback: (err?: Error) => void);
}

export declare function createInstance(): BasicAuthHandler;
