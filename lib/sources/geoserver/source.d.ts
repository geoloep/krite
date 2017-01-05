import { IDataSource, ILayer } from '../../types';
export interface IGeoServerSourceOptions {
    wfs?: boolean;
    wfsNamespace?: string;
    field?: string;
}
export declare class GeoServerSource implements IDataSource {
    readonly url: string;
    readonly options: IGeoServerSourceOptions;
    capabilities: any;
    wfscapabilities: any;
    private wfsFeature;
    private wfsFeatureTypes;
    private wfsFeatureToType;
    private layersLoaded;
    private layerNames;
    private layers;
    constructor(url: string, options?: IGeoServerSourceOptions);
    getLayers(): Promise<{
        [index: string]: ILayer;
    }>;
    getLayerNames(): Promise<string[]>;
    getLayer(name: string): Promise<ILayer>;
    private getCapabilities();
}
