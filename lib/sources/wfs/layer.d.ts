/// <reference types="leaflet" />
/// <reference types="geojson" />
import * as L from 'leaflet';
import { WFSSource } from './source';
import { ILayer } from '../../types';
export declare class WFSLayer implements ILayer {
    readonly capabilities: any;
    readonly source: WFSSource;
    _leaflet: L.GeoJSON;
    _geojson: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>;
    private ZIndex;
    constructor(capabilities: any, source: WFSSource);
    readonly title: any;
    readonly name: any;
    readonly abstract: any;
    readonly bounds: undefined;
    readonly preview: string;
    readonly leaflet: L.Layer;
    readonly legend: string;
}
