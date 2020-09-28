// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved
import {HttpApplicationService} from "./types";

export declare abstract class CacheStrategy extends HttpApplicationService {
    abstract add(key: string, value: any, absoluteExpiration?: number): Promise<any>;

    abstract remove(key: string): Promise<any>;

    abstract clear(): Promise<any>;

    abstract get(key: string): Promise<any>;

    abstract getOrDefault(key: string, fn: Promise<any>, absoluteExpiration?: number): Promise<any>;

}

export declare class DefaultCacheStrategy extends CacheStrategy {
    add(key: string, value: any, absoluteExpiration?: number): Promise<any>;

    clear(): Promise<any>;

    get(key: string): Promise<any>;

    getOrDefault(key: string, fn: Promise<any>, absoluteExpiration?: number): Promise<any>;

    remove(key: string): Promise<any>;

}
