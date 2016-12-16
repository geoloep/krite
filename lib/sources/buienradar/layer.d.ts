/// <reference types="leaflet" />
import * as L from 'leaflet';
import { NumeralService } from '../../services/numeral';
import { ILayer, ILayerClickHandler, TAttributes, IAttributeTypeFunc } from '../../types';
export declare class BuienradarLayer implements ILayer {
    readonly capabilities: any;
    group: L.FeatureGroup;
    onClickCallbacks: ILayerClickHandler[];
    numeral: NumeralService;
    private floatAttr;
    private ignoreAttr;
    private celciusAttr;
    private percentAttr;
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
    stationType(naam: any): any;
    celciusType: (getal: any) => string;
    icoonType(icoon: any): string;
    msType: (getal: any) => string;
    getType(attr: string): TAttributes | IAttributeTypeFunc;
    private makeLayer();
    private clickHandler(weerstation);
}
