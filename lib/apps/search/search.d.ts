import { RactiveApp } from '../ractiveApp';
import { IContainer } from '../../types';
export declare class SearchApp extends RactiveApp {
    private map;
    private geocode;
    private searchTimeOut;
    private timeOutLength;
    private diepteNaarZoom;
    private depthOrder;
    constructor(element?: IContainer | string);
    protected createRactive(element: string): void;
    private search;
    private searchClick(context);
    private searchSuccess;
    private searchFail;
    private selectDown;
    private selectReset();
    private selectUp;
}
