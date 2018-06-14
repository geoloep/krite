export interface IApp {
    name: string;

    insert(element: IContainer | string | undefined): void;
    detatch(): void;
}

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

    minZoom?: number;

    maxZoom?: number;

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
     * Perform a non spatial query
     * @param options Filter options
     * @param options.id Request a single feature by id
     * @param options.filters Keys as fieldnames and strings as contents to match
     * @param options.properties List of properties to return, leave blank to return all
     */
    filter?(options: {
        id?: string,
        filters?: {[index: string]: string},
        properties?: string[],
    }): Promise<GeoJSON.FeatureCollection<GeoJSON.GeometryObject>>;

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
    getLayerNames(): Promise<string[]>;
    getLayer(name: string): Promise<ILayer>;
}

export interface IContainer {
    register(app: IApp): void;
    deregister(): void;
}

export type IClickHandler = (point: L.Point) => void;


export type IOnClickHandler = (attr: { [index: string]: any }) => void;

export type ILayerClickHandler = (layer: ILayer, attr: { [index: string]: any }) => void;

export type TAttributes = 'skip' | 'string' | 'float' | 'int' | 'percentage' | 'href';

export type IAttributeTypeFunc = (attr: any) => string;

/**
 * Service that governs all the coordinate system conversions
 */
export interface IProjectionService {
    /**
     * CRS Identifiers
     */
    identifiers: {
        /**
         * Identifier of the crs used by leaflet
         */
        leaflet: string;

        /**
         * Identifier of the crs used inside krite
         */
        krite: string;
    };

    /**
     * Convert GeoJson towards leaflet crs
     */
    geoTo(geojson: any): any;

    /**
     * Convert GeoJson from leaflet
     */
    geoFrom(geojson: any): any;

    /**
     * Convert a point for use in leaflet
     */
    pointTo(point: L.Point): L.LatLng;

    /**
     * Convert a point originating from leaflet
     */
    pointFrom(latLng: L.LatLng): L.Point;

    /**
     * Wrapper of the internal project function
     */
    project(latLng: L.LatLng): L.Point;

    /**
     * Wrapper of the internal unporject function
     */
    unproject(point: L.Point): L.LatLng;
}
