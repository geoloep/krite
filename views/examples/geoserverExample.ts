import { addToLog, createRdMap } from './utils';
import { GeoserverSource } from '@/sources';

export const geoserverWmsExample = async () => {
    const krite = createRdMap();

    const source = new GeoserverSource(
        'https://geo.rijkswaterstaat.nl/services/ogc/gdr/bodemhoogte_zeeland/ows'
    );
    source.added(krite);

    const layer = await source.getLayer('bodemhoogte_zeeland');
    addToLog('Got layer');

    krite.map.addLayer(layer);
    addToLog('Added layer');
};

export const geoserverWfsExample = async () => {
    const krite = createRdMap();

    const source = new GeoserverSource(
        'https://geo.rijkswaterstaat.nl/services/ogc/gdr/weggeg/ows'
    );
    source.added(krite);

    const layer = await source.getLayer('bebouwde_kommen_wegvak');
    addToLog('Got layer');

    krite.map.addLayer(layer);
    addToLog('Added layer');

    const intersection = await layer.intersects({
        type: 'LineString',
        coordinates: [
            [85070, 458537],
            [85120, 458537],
        ],
    });

    addToLog(`Got ${intersection.features.length} features`);

    const filtered = await layer.filter({
        filters: {
            OBJECTID: 247,
        },
    });

    addToLog(`Got feature ${filtered.features[0].id}`);
};
