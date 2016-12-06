import { AardbevingLayer } from './layer';
import { IDataSource, ILayer } from '../../types';
export declare class AardbevingenSource implements IDataSource {
    layer: AardbevingLayer;
    private capabilities;
    constructor();
    getLayers(): Promise<{
        [index: string]: ILayer;
    }>;
    getLayerNames(): Promise<string[]>;
    getLayer(name: string): Promise<ILayer>;
    private makeLayer();
}
