// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
import {HttpApplicationService} from "./types";
import * as NodeCache from "node-cache";

export declare abstract class CacheStrategy extends HttpApplicationService {
    abstract add(key: string, value: any, absoluteExpiration?: number): Promise<any>;

    abstract remove(key: string): Promise<any>;

    abstract clear(): Promise<any>;

    abstract get(key: string): Promise<any>;

    abstract getOrDefault(key: string, fn: Promise<any>, absoluteExpiration?: number): Promise<any>;

    abstract finalize(): Promise<void>;

    abstract finalizeAsync(): Promise<void>;

}

export declare class DefaultCacheStrategy extends CacheStrategy {

    get rawCache(): NodeCache;

    add(key: string, value: any, absoluteExpiration?: number): Promise<any>;

    clear(): Promise<any>;

    get(key: string): Promise<any>;

    getOrDefault(key: string, fn: Promise<any>, absoluteExpiration?: number): Promise<any>;

    remove(key: string): Promise<any>;

    finalize(): Promise<void>;

    finalizeAsync(): Promise<void>;

}
