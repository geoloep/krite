import { addToLog, createRdMap } from './utils';
import { OWSSource } from '../../src/sources/ows/source';
import { Point } from 'leaflet';

export const owsExample = async () => {
    const krite = createRdMap();

    const source = new OWSSource(
        'https://service.pdok.nl/kadaster/bestuurlijkegebieden/{service}/v1_0'
    );
    source.added(krite);

    const layer = await source.getLayer('Gemeentegebied');
    addToLog('Got layer');

    krite.map.addLayer(layer);
    addToLog('Added layer');

    const intersection = await layer.intersectsPoint(new Point(237563, 554329));

    addToLog(
        `Got feature ${intersection.features[0].properties.identificatie}`
    );

    const filtered = await layer.filter({
        filters: {
            naam: 'Groningen',
        },
    });

    addToLog(`Got feature ${filtered.features[0].properties.identificatie}`);
};
