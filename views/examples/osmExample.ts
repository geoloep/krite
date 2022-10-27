import { addToLog, createWebMercatorMap } from './utils';
import { OsmSource } from '@/sources';

export const osmExample = async () => {
    const krite = createWebMercatorMap();

    const source = new OsmSource();

    const layer = await source.getLayer('Openstreetmap');
    addToLog('Got layer');

    krite.map.addLayer(layer);
    addToLog('Added layer');
};
