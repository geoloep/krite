import * as L from 'leaflet';

import { IDataSource } from '../../types';

import { WMTSSource } from '../wmts/source';
import { WMTSLayer } from '../wmts/layer';

let pdokSource = new WMTSSource('https://geodata.nationaalgeoregister.nl/wmts/');
let pdokLufoSource = new WMTSSource('https://geodata.nationaalgeoregister.nl/luchtfoto/wmts/');
// let openbasiskaartSource = new WMTSSource('http://www.openbasiskaart.nl/mapcache/wmts/');

/**
 * This source is a convenience for adding basemaps relevant to Dutch mapping projects
 */
export class NLBasemapsSource implements IDataSource {
    basemaps: {
        [index: string]: {
            source: WMTSSource,
            layer: string
        }
    } = {
        'pdok/brtachtergrondkaart': {
            source: pdokSource,
            layer: 'brtachtergrondkaart',
        },
        'pdok/brtachtergrondkaartgrijs': {
            source: pdokSource,
            layer: 'brtachtergrondkaartgrijs',
        },
        'pdok/brtachtergrondkaartpastel': {
            source: pdokSource,
            layer: 'brtachtergrondkaartpastel',
        },
        'pdok/opentopoachtergrondkaart': {
            source: pdokSource,
            layer: 'opentopoachtergrondkaart',
        },
        'pdok/top25raster': {
            source: pdokSource,
            layer: 'top25raster',
        },
        'pdok/top50raster': {
            source: pdokSource,
            layer: 'top50raster',
        },
        'pdok/top100raster': {
            source: pdokSource,
            layer: 'top100raster',
        },
        'pdok/top250raster': {
            source: pdokSource,
            layer: 'top250raster',
        },
        'pdok/top500raster': {
            source: pdokSource,
            layer: 'top500raster',
        },
        'pdok/top1000raster': {
            source: pdokSource,
            layer: 'top1000raster',
        },
        // 'openbasiskaart/openbasiskaart': {
        //     source: openbasiskaartSource,
        //     layer: 'openbasiskaart.nl: OpenStreetMap ondergrondkaart',
        // } Tilematrixset heeft ongebruikelijke naam, eerst ondersteunin in WMTSLayer toevoegen
        'pdok/luchtofoto_actueel': {
            source: pdokLufoSource,
            layer: 'Luchtfoto Actueel Ortho 25cm RGB',
        }
    }

    async getLayerNames() {
        return Object.keys(this.basemaps)
    }

    async getLayer(name: string) {
        let basemap = this.basemaps[name];

        if (!basemap) {
            console.error(`Layer ${name} not available`);
        }

        let layer = (await basemap.source.getLayer(basemap.layer)) as WMTSLayer;

        // Change preview location
        layer.previewSet = 6;
        layer.previewCol = 30;
        layer.previewRow = 32;

        return layer;
    }
}