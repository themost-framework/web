// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved
import {BeginRequestHandler} from "../types";
import {HttpContext} from "../context";

export declare class PostHandler implements BeginRequestHandler{
    beginRequest(context: HttpContext, callback: (err?: Error) => void);

}

export declare class UnknownValue {
    static convert(value: string): any;

    static DateTimeRegex: RegExp;
    static BooleanTrueRegex: RegExp;
    static BooleanFalseRegex: RegExp;
    static NullRegex: RegExp;
    static UndefinedRegex: RegExp;
    static IntegerRegex: RegExp;
    static FloatRegex: RegExp;
}

export declare function createInstance(): PostHandler;
