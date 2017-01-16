/// <reference types="leaflet" />
import { ILayer } from '../../types';
import { ESRISource } from './source';
export declare class ESRITiledMapLayer implements ILayer {
    readonly url: string;
    readonly capabilities: any;
    readonly source: ESRISource;
    _leaflet: L.Layer;
    constructor(url: string, capabilities: any, source: ESRISource);
    readonly title: any;
    readonly name: any;
    readonly abstract: any;
    readonly bounds: undefined;
    readonly preview: string;
    readonly leaflet: L.Layer;
    readonly legend: string;
}
