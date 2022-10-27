import { addToLog, createRdMap } from './utils';
import { NLBasemapsSource } from '@/sources';

export const nlbasemapsExample = async () => {
    const krite = createRdMap();

    const source = new NLBasemapsSource();
    source.added(krite);

    for (const layerName of await source.getLayerNames()) {
        try {
            const layer = await source.getLayer(layerName);

            try {
                krite.map.addLayer(layer);
            } catch (e) {
                console.trace(e);
                addToLog(`Error getting layer! ${e}`);
            }

            addToLog(`Added layer ${layerName}`);
        } catch (e) {
            addToLog(`Error adding layer! ${e}`);
        }
    }
};
