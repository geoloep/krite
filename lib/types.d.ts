/// <reference types="leaflet" />
/// <reference types="geojson" />
import { RactiveApp } from './apps/ractiveApp';
/**
 * All maps layers should implement this interface.
 */
export interface ILayer {
    hasOperations?: boolean;
    hasOnClick?: boolean;
    title: string;
    name: string;
    abstract: string;
    bounds: L.LatLngBounds | undefined;
    preview: string;
    leaflet: L.Layer;
    legend: string;
    onClick?(func: ILayerClickHandler): void;
    intersects?(feature: GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.GeometryObject): Promise<GeoJSON.FeatureCollection<GeoJSON.GeometryObject>>;
    intersectsPoint?(point: L.Point): Promise<GeoJSON.FeatureCollection<GeoJSON.GeometryObject>>;
    getType?(attr: string): TAttributes | IAttributeTypeFunc;
}
export interface IBasemap {
    preview: string;
    url: string;
    options: L.TileLayerOptions;
}
export interface IDataSource {
    getLayers(): Promise<{
        [index: string]: ILayer;
    }>;
    getLayerNames(): Promise<string[]>;
    getLayer(name: string): Promise<ILayer>;
}
export interface IContainer {
    register(app: RactiveApp): void;
    deregister(): void;
}
export interface IClickHandler {
    (point: L.Point): void;
}
export interface IOnClickHandler {
    (attr: {
        [index: string]: any;
    }): void;
}
export interface ILayerClickHandler {
    (layer: ILayer, attr: {
        [index: string]: any;
    }): void;
}
export declare type TAttributes = 'skip' | 'string' | 'float' | 'int' | 'percentage' | 'href';
export interface IAttributeTypeFunc {
    (attr: any): string;
}
