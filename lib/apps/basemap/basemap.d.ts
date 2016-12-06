import { RactiveApp } from '../ractiveApp';
import { IContainer } from '../../types';
export declare class BasemapApp extends RactiveApp {
    readonly element: IContainer | string;
    private map;
    private service;
    constructor(element?: IContainer | string);
    protected createRactive(element: string): void;
}
