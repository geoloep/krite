/// <reference types="geojson" />
/**
 * Reproject GeoJSON between map and krite crs
 */
export declare class ProjectService {
    readonly def: string;
    constructor(def: string);
    /**
     * reproject from the krite crs to wgs84
     */
    to(geojson: GeoJSON.GeoJsonObject | GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | GeoJSON.GeometryCollection): any;
    /**
     * reproject from wgs84 tot the krite crs
     */
    from(geojson: GeoJSON.GeoJsonObject | GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | GeoJSON.GeometryCollection): any;
}
