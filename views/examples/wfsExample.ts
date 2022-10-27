import { addToLog, createRdMap } from './utils';
import { WFSLayer } from '@/sources/wfs/layer';

export const wfsExample = async () => {
    addToLog('Example does not work due to bug in Leaflet-WFST');

    const krite = createRdMap();

    const layer = new WFSLayer({
        url: 'https://service.pdok.nl/kadaster/bestuurlijkegebieden/wfs/v1_0',
        typeName: 'Provinciegebied',
        geometryField: 'geom',
        crs: krite.map.leaflet.options.crs,
        typeNS: 'bestuurlijkegebieden',
    });
    addToLog('Got layer');

    krite.map.addLayer(layer);
    addToLog('Added layer');
};
