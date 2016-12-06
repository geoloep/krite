import * as L from 'leaflet';
import { GeoServerSource } from './source';
import { ILayer } from '../../types';
export declare class GeoserverLayer implements ILayer {
    readonly capabilities: any;
    readonly source: GeoServerSource;
    _leaflet: L.WMS;
    private ZIndex;
    constructor(capabilities: any, source: GeoServerSource);
    readonly canGetInfoAtPoint: boolean;
    readonly hasOnClick: boolean;
    readonly title: any;
    readonly name: any;
    readonly abstract: any;
    readonly bounds: undefined;
    readonly boundingBox: number[];
    getInfoAtPoint(point: any): Promise<any>;
    getPreviewSize(bbox: number[], width: number): {
        height: number;
        width: number;
    };
    readonly preview: string;
    readonly leaflet: L.WMS;
    readonly legend: string;
}
