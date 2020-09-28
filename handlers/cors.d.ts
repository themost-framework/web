// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved
import {PostMapRequestHandler} from "../types";
import {HttpContext} from "../context";

export declare class CorsHandler implements PostMapRequestHandler {
    postMapRequest(context: HttpContext, callback: (err?: Error) => void);

}

export declare function createInstance(): CorsHandler;
