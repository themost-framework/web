// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved
export declare class HttpRoute {
    constructor(route: string);
    constructor(route: any);
    isMatch(urlToMatch: string): boolean;
    routeData?: any;
    route?: any;
    routeIndex?: number;
    patterns: any;
    parsers: any;
}

export declare function createInstance(): HttpRoute;
