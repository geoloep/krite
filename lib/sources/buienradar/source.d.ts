import { BuienradarLayer } from './layer';
import { IDataSource, ILayer } from '../../types';
export declare class BuienradarSource implements IDataSource {
    layer: BuienradarLayer;
    private capabilities;
    constructor();
    getLayers(): Promise<{
        [index: string]: ILayer;
    }>;
    getLayerNames(): Promise<string[]>;
    getLayer(name: string): Promise<ILayer>;
    private makeLayer();
}
