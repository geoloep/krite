import { RactiveApp } from './apps/ractiveApp';

export interface ILayer {
    canGetInfoAtPoint?: boolean; //@todo: verwijderen
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
    intersects?(feature: string | toWKT | GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.GeometryObject): Promise<any>;
    getInfoAtPoint?(point: L.Point): Promise<any>;
    getType?(attr: string): TAttributes | IAttributeTypeFunc;
}

export interface IBasemap {
    preview: string;
    url: string;
    options: L.TileLayerOptions;
}

export interface IDataSource {
    getLayers(): Promise<{ [index: string]: ILayer }>;
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
    (attr: { [index: string]: any }): void;
}

export interface ILayerClickHandler {
    (layer: ILayer, attr: { [index: string]: any }): void;
}

export type TAttributes = 'skip' | 'string' | 'float' | 'int' | 'percentage' | 'href';
export interface IAttributeTypeFunc {
    (attr: any): string;
}

export interface toWKT {
    toWKT(): string;
}