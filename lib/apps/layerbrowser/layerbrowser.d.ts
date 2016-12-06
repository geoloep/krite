import { RactiveApp } from '../ractiveApp';
import { IContainer } from '../../types';
export declare class LayerBrowserApp extends RactiveApp {
    private selectedSource;
    private service;
    private map;
    private sidebar;
    private selectedLayer;
    constructor(element?: IContainer | string);
    protected createRactive(element: string): void;
}
