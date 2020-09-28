// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved
import {HttpContext} from "./context";

export declare class HttpConsumer {
    constructor(callable:(...args: any[])=> Promise<any>, params?: any);
    callable:(...args: any[])=> Promise<any>;
    params?: any;
    run(context: HttpContext, ...args: any[]);
}
