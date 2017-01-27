/// <reference types="leaflet" />
/// <reference types="geojson" />
import * as L from 'leaflet';
import { GeoServerSource } from './source';
import { ILayer, toWKT } from '../../types';
export declare class GeoserverLayer implements ILayer {
    readonly capabilities: any;
    readonly wfscapabilities: any;
    readonly type: any;
    readonly source: GeoServerSource;
    _leaflet: L.WMS;
    _geomField: string;
    private _isPoint;
    private _withinDistance;
    private ZIndex;
    constructor(capabilities: any, wfscapabilities: any, type: any, source: GeoServerSource);
    readonly canGetInfoAtPoint: boolean;
    readonly hasOperations: boolean;
    readonly hasOnClick: boolean;
    readonly title: any;
    readonly name: any;
    readonly abstract: any;
    readonly bounds: undefined;
    readonly boundingBox: number[];
    intersects(feature: string | toWKT | GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.GeometryObject): Promise<any>;
    getInfoAtPoint(point: any): Promise<any>;
    getPreviewSize(bbox: number[], width: number): {
        height: number;
        width: number;
    };
    readonly preview: string;
    readonly leaflet: L.WMS;
    readonly legend: string;
    private _getInfoAtPoint(point);
    private _getInfoNearPoint(point);
    private readonly typename;
    private readonly geomField;
    readonly isPoint: boolean;
}
