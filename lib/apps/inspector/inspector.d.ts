import { RactiveApp } from '../ractiveApp';
import { ILayerClickHandler, IContainer } from '../../types';
export declare class InspectorApp extends RactiveApp {
    readonly element: IContainer | string;
    private visible;
    private map;
    private service;
    private numeral;
    private sidebar;
    private active;
    constructor(element?: IContainer | string);
    onClick: (point: L.Point) => void;
    onLayerClick: ILayerClickHandler;
    show: (data: any) => void;
    showTable(properties: {
        [index: string]: any;
    }): void;
    insert(element: string | undefined): void;
    detatch(): void;
    protected createRactive(element: string): void;
}
