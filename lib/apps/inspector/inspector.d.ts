/// <reference types="leaflet" />
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
    private features;
    private index;
    constructor(element?: IContainer | string);
    onClick: (point: L.Point) => Promise<void>;
    onLayerClick: ILayerClickHandler;
    insert(element: string | undefined): void;
    detatch(): void;
    protected createRactive(element: string): void;
    private clear();
    private loadFeature;
    private loadFeatureCollection;
    private showTable(properties);
}
