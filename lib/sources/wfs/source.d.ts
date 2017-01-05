import { IDataSource, ILayer } from '../../types';
export declare class WFSSource implements IDataSource {
    readonly url: string;
    capabilities: any;
    private layersLoaded;
    private layerNames;
    private layers;
    constructor(url: string);
    getLayers(): Promise<{
        [index: string]: ILayer;
    }>;
    getLayerNames(): Promise<string[]>;
    getLayer(name: string): Promise<ILayer>;
    private getCapabilities();
}
