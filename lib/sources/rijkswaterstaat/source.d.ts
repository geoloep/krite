import { IDataSource, ILayer } from '../../types';
export declare class RijkswaterstaatSource implements IDataSource {
    private capabilities;
    private layers;
    private layerNames;
    private nameToType;
    constructor();
    getLayers(): Promise<{
        [index: string]: ILayer;
    }>;
    getLayerNames(): Promise<string[]>;
    getLayer(name: string): Promise<ILayer>;
    private makeLayers();
}
