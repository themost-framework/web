// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved
import {HttpApplication} from "./app";

export declare interface ServiceConfigurationElement {
    serviceType: string;
    strategyType: string;
}

export declare class ServicesConfiguration {
    config(app: HttpApplication);
}
