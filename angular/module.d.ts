// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
import {HttpApplicationService} from "../types";
import * as angular from "angular";
import IModule = angular.IModule;

export declare class AngularServerModule extends HttpApplicationService {

    defaults: any;
    useBootstrapModule(modulePath: string): AngularServerModule;
    bootstrap(bootstrapFunc: (angular: angular.IAngularStatic)=> IModule): AngularServerModule;
    service(name: string, ctor: any): AngularServerModule;
    directive(name: string, ctor: any): AngularServerModule;
    filter(name: string, ctor: any): AngularServerModule;
    controller(name: string, ctor: any): AngularServerModule;
    createDocument(s: string): HTMLDocument;

}
