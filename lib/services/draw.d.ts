/// <reference types="geojson" />
import 'leaflet-draw';
export declare class DrawService {
    private service;
    private project;
    private lock;
    constructor();
    rectangle(): Promise<GeoJSON.Feature<GeoJSON.Polygon>>;
    polyline(): Promise<GeoJSON.Feature<GeoJSON.LineString>>;
    polygon(): Promise<GeoJSON.Feature<GeoJSON.Polygon>>;
    private draw<T>(draw);
}
