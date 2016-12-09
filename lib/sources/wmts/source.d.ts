import { IDataSource, ILayer } from '../../types';
export declare class WMTSSource implements IDataSource {
    readonly url: string;
    readonly options: any;
    capabilities: any | undefined;
    private layersLoaded;
    private layerNames;
    private layers;
    constructor(url: string, options?: any);
    getLayers(): Promise<{
        [index: string]: ILayer;
    }>;
    getLayerNames(): Promise<string[]>;
    getLayer(name: string): Promise<ILayer>;
    private getCapabilities();
}
