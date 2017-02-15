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
    private draw;
    private active;
    private pointInspect;
    private features;
    private index;
    constructor(element?: IContainer | string);
    insert(element: string | undefined): void;
    detatch(): void;
    /**
     * Handle click events fired by clicking on the map. Only proceed if we're not drawing other inspection shapes
     */
    onClick: (point: L.Point) => Promise<void>;
    /**
     * Handle click events fired by clicking on a specific marker. Ignore if we're drawing inspection shapes
     */
    onLayerClick: ILayerClickHandler;
    protected createRactive(element: string): void;
    private escape;
    private toggleModeDropdown();
    private clear();
    private intersect(feature);
    private loadFeature;
    private loadFeatureCollection;
    private startShapeSelect();
    private shapeSelect();
    private showTable(properties);
}
