import * as L from 'leaflet';
import { ILayer, ILayerClickHandler, TAttributes, IAttributeTypeFunc } from '../../types';
export declare class AardbevingLayer implements ILayer {
    readonly capabilities: any;
    group: L.FeatureGroup;
    onClickCallbacks: ILayerClickHandler[];
    private attrTypes;
    constructor(capabilities: any);
    readonly canGetInfoAtPoint: boolean;
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
    private parseAttributes(aardbeving);
    private clickHandler(aardbeving);
}
