/// <reference types="leaflet" />
import * as L from 'leaflet';
import { ILayer, ILayerClickHandler, TAttributes, IAttributeTypeFunc } from '../../types';
export declare class WindrichtingLayer implements ILayer {
    readonly capabilities: any;
    group: L.FeatureGroup;
    onClickCallbacks: ILayerClickHandler[];
    private _legend;
    private attrTypes;
    constructor(capabilities: any);
    readonly hasOnClick: boolean;
    readonly name: string;
    readonly title: string;
    readonly abstract: string;
    readonly bounds: L.LatLngBounds;
    readonly preview: string;
    readonly leaflet: L.FeatureGroup;
    readonly legend: string;
    onClick(fun: ILayerClickHandler): void;
    getType(attr: string): TAttributes | IAttributeTypeFunc;
    private makeLayer();
    private clickHandler(feature);
}
