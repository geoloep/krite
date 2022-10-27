import { addToLog, createRdMap } from './utils';
import { WMTSSource } from '../../src/sources';

export const wmtsExample = async () => {
    const krite = createRdMap();

    const source = new WMTSSource(
        'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0'
    );
    source.added(krite);

    for (const layerName of await source.getLayerNames()) {
        addToLog(`Found layer ${layerName}`);
    }

    const layer = await source.getLayer('pastel');
    addToLog('Got layer');

    krite.map.addLayer(layer);
    addToLog('Added layer');
};
