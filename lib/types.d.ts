/// <reference types="leaflet" />
/// <reference types="geojson" />
import { RactiveApp } from './apps/ractiveApp';
/**
 * All maps layers should implement this interface.
 */
export interface ILayer {
    /**
     * True if this layer supports geoprocessing operations
     */
    hasOperations?: boolean;
    /**
     * True if this layer fires click events
     */
    hasOnClick?: boolean;
    title: string;
    name: string;
    abstract: string;
    bounds: L.LatLngBounds | undefined;
    preview: string;
    leaflet: L.Layer;
    legend: string;
    /**
     * Register your onClick functions here
     */
    onClick?(func: ILayerClickHandler): void;
    /**
     * Intersect the layer with the input GeoJSON Feature
     * @param feature Should be in the CRS of the map
     * @returns Should be in the crs of the map
     */
    intersects?(feature: GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.GeometryObject): Promise<GeoJSON.FeatureCollection<GeoJSON.GeometryObject>>;
    /**
     * Interect the layer with the input Leaflet Point
     * @param point Should be in de crs of the map
     * @returns Should be in de crs of the map
     */
    intersectsPoint?(point: L.Point): Promise<GeoJSON.FeatureCollection<GeoJSON.GeometryObject>>;
    /**
     * Get the type of an property of this layer
     */
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
