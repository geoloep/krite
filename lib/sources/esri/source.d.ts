import { IDataSource, ILayer } from '../../types';
export interface IESRIServiceListing {
    name: string;
    type: string;
    url?: string;
}
export interface IESRIServiceList {
    currentVersion: number;
    folders: any[];
    services: IESRIServiceListing[];
}
export declare class ESRISource implements IDataSource {
    readonly url: string;
    services: IESRIServiceList;
    typeToLayer: {
        [index: string]: any;
    };
    private layers;
    constructor(url: string);
    getLayers(): Promise<{
        [index: string]: ILayer;
    }>;
    getLayerNames(): Promise<string[]>;
    _getLayerNames(): string[];
    getLayer(name: string): Promise<ILayer>;
    private getServices();
}
