/// <reference types="leaflet" />
import 'leaflet-towkt';
import * as L from 'leaflet';
import { ILayer, IClickHandler, ILayerClickHandler } from '../types';
/**
 * This service controls the leaflet map.
 */
export declare class MapService {
    readonly element: string;
    readonly customOptions: L.MapOptions;
    HTMLElement: HTMLElement;
    layers: ILayer[];
    layerByName: {
        [index: string]: ILayer;
    };
    map: L.Map;
    defaultOptions: L.MapOptions;
    private basemap;
    private highlight;
    private pointer;
    private clickHandlers;
    private layerClickCallbacks;
    constructor(element: string, customOptions?: L.MapOptions);
    /**
     * Add a new layer to the map
     */
    addLayer(layer: ILayer): void;
    /**
     * Show previously hidden layers again
     */
    showLayer(layer: ILayer): void;
    hasLayerByName(name: string): boolean;
    /**
     * Hide a layer from the map only
     */
    hideLayer(layer: ILayer): void;
    /**
     * Register onclick callbacks here
     */
    onClick(fun: IClickHandler): void;
    /**
     * Register onLayerClick callbacks here
     */
    onLayerClick(func: ILayerClickHandler): void;
    /**
     * Layers can report click events here
     */
    layerClick: (layer: ILayer, attr: any) => void;
    setZIndexes(): void;
    /**
     * Render a geojson source on the map.
     * @param geojson   Expected to be in the map crs
     */
    addHighlight(geojson: any, zoomTo?: boolean): void;
    hideHighlight(): void;
    /**
     * Show previously hidden highlight again
     */
    showHighlight(): void;
    /**
     * Permanently remove a layer from the map
     */
    removeLayer(layer: ILayer): void;
    /**
     * Set the basemap. Only L.TileLayers are supported at the moment
     */
    setBaseMap(url: string, options: L.TileLayerOptions): void;
    /**
     * Inform the map that the user is in inspect mode
     */
    startInspect(): void;
    endInspect(): void;
    fitBounds(bounds: L.LatLngBounds | undefined): void;
    /**
     * Zoom to a point
     * @param point In the CRS of the map
     */
    zoomToPoint(point: number[], zoom: number): void;
    /**
     * Zoom to a point
     * @param point In LatLng (WGS84)
     */
    zoomToWgsPoint(point: [number, number] | L.LatLng, zoom: number): void;
}
