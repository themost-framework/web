// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved
import {PostExecuteResultHandler, PreExecuteResultArgs} from "../types";
import {HttpContext} from "../context";

export declare class DirectiveEngine implements PostExecuteResultHandler {
    postExecuteResult(args: PreExecuteResultArgs, callback: (err?: Error) => void);
}

export declare class PostExecuteResultArgs {
    context: HttpContext;
    target: any;
}

export declare function createInstance(): DirectiveEngine;
