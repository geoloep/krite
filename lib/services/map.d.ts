/// <reference types="leaflet" />
import * as L from 'leaflet';
import { ILayer, IClickHandler, ILayerClickHandler } from '../types';
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
    addLayer(layer: ILayer): void;
    showLayer(layer: ILayer): void;
    hasLayerByName(name: string): boolean;
    hideLayer(layer: ILayer): void;
    onClick(fun: IClickHandler): void;
    onLayerClick(func: ILayerClickHandler): void;
    layerClick: (layer: ILayer, attr: any) => void;
    setZIndexes(): void;
    addHighlight(geojson: any): void;
    hideHighlight(): void;
    showHighlight(): void;
    removeLayer(layer: ILayer): void;
    setBaseMap(url: string, options: L.TileLayerOptions): void;
    startInspect(): void;
    endInspect(): void;
    fitBounds(bounds: L.LatLngBounds | undefined): void;
    zoomToPoint(point: number[], zoom: number): void;
    zoomToWgsPoint(point: [number, number], zoom: number): void;
}
