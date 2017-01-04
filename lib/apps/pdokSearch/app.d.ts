import { RactiveApp } from '../ractiveApp';
import { IContainer } from '../../types';
export declare class PdokSearchApp extends RactiveApp {
    private map;
    private locatieserver;
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
