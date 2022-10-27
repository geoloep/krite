import { addToLog, createRdMap } from './utils';
import { ESRISource } from '../../src/sources';

export const esriExample = async () => {
    const krite = createRdMap();

    const source = new ESRISource(
        'https://services.arcgisonline.nl/arcgis/rest/services/Basiskaarten/'
    );

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
