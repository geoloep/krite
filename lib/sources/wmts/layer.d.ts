import * as L from 'leaflet';
import { WMTSSource } from './source';
import { ILayer } from '../../types';
export declare class WMTSLayer implements ILayer {
    private capabilities;
    readonly source: WMTSSource;
    _leaflet: L.TileLayer;
    constructor(capabilities: any, source: WMTSSource);
    readonly title: any;
    readonly name: any;
    readonly abstract: any;
    readonly bounds: undefined;
    readonly preview: string;
    readonly leaflet: L.TileLayer;
    readonly legend: string;
}
