// @themost-framework 2.0 Codename Blueshift Copyright (c) 2017-2025, THEMOST LP All rights reserved
import {HttpController} from "../mvc";

declare class HttpDataModelController extends HttpController{
    public getItem():Promise<any>;
    public showItem():Promise<any>;
    public postItem():Promise<any>;
    public deleteItem():Promise<any>;
    public createItem():Promise<any>;
    public getItems():Promise<any>;
    public postItems():Promise<any>;
    public putItems():Promise<any>;
    public deleteItems():Promise<any>;

}

export default HttpDataModelController;
