// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
import {HttpContext} from "../context";
import {HttpViewEngine} from "../types";

export declare class VashEngine extends HttpViewEngine {
    constructor(context: HttpContext);

    context: HttpContext;
    getContext(): HttpContext;
    render(filename: string, data: any, callback: (err?: Error, res?: string) => void)

}

export declare function createInstance(): VashEngine;
