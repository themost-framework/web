// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
import {HttpApplication} from "./app";
import {HttpJsonResult} from "./mvc";
import {ODataModelBuilder} from "@themost/data";

export declare class ODataModelBuilderConfiguration {
    static config(app: HttpApplication): Promise<any>;
    static configSync(app: HttpApplication): ODataModelBuilder;
}

export declare class ODataJsonResult extends HttpJsonResult {
    entitySet: any;
}
