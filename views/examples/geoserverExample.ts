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
        'https://geo.rijkswaterstaat.nl/services/ogc/gdr/vild/ows'
    );
    source.added(krite);

    const layer = await source.getLayer('bebouwde_kom');
    addToLog('Got layer');

    krite.map.addLayer(layer);
    addToLog('Added layer');

    const intersection = await layer.intersects({
        type: 'Polygon',
        coordinates: [
            [
                [228340, 563547],
                [249389, 563547],
                [249389, 545189],
                [228340, 545189],
                [228340, 563547],
            ],
        ],
    });

    addToLog(`Got ${intersection.features.length} features`);

    const filtered = await layer.filter({
        filters: {
            oid: 3305,
        },
    });

    addToLog(`Got feature ${filtered.features[0].id}`);
};
