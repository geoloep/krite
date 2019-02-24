/*
Copyright 2018 Geoloep

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { IDataSource } from '../../types';

import { WMTSLayer } from '../wmts/layer';
import { WMTSSource } from '../wmts/source';

const pdokSource = new WMTSSource('https://geodata.nationaalgeoregister.nl/tiles/service/wmts/');
const pdokLufoSource = new WMTSSource('https://geodata.nationaalgeoregister.nl/luchtfoto/rgb/wmts/');
const pdokLufoInfraSource = new WMTSSource('https://geodata.nationaalgeoregister.nl/luchtfoto/infrarood/wmts/');

/**
 * This source is a convenience for adding basemaps relevant to Dutch mapping projects
 */
export class NLBasemapsSource implements IDataSource {
    basemaps: {
        [index: string]: {
            source: WMTSSource,
            layer: string,
        },
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
        'pdok/bgtstandaard': {
            source: pdokSource,
            layer: 'bgtstandaard',
        },
        'pdok/bgtachtergrond': {
            source: pdokSource,
            layer: 'bgtachtergrond',
        },
        'pdok/bgtpastel': {
            source: pdokSource,
            layer: 'bgtpastel',
        },
        // 'openbasiskaart/openbasiskaart': {
        //     source: openbasiskaartSource,
        //     layer: 'openbasiskaart.nl: OpenStreetMap ondergrondkaart',
        // } Tilematrixset heeft ongebruikelijke naam, eerst ondersteuning in WMTSLayer toevoegen
        'pdok/luchtfoto_actueel': {
            source: pdokLufoSource,
            layer: 'Luchtfoto Actueel Ortho 25cm RGB',
        },
        'pdok/luchtfoto_2018': {
            source: pdokLufoSource,
            layer: 'Luchtfoto 2018 Ortho 25cm RGB',
        },
        'pdok/luchtfoto_2017': {
            source: pdokLufoSource,
            layer: 'Luchtfoto 2017 Ortho 25cm RGB',
        },
        'pdok/luchtfoto_2017_infrarood': {
            source: pdokLufoInfraSource,
            layer: 'Luchtfoto 2017 Ortho 25cm Infrarood',
        },
        'pdok/luchtfoto_2016': {
            source: pdokLufoSource,
            layer: 'Luchtfoto 2016 Ortho 25cm RGB',
        },
        'ahn/3 50cm dsm': {
            source: pdokSource,
            layer: 'ahn3_05m_dsm',
        },
        'ahn/2 50cm ruw': {
            source: pdokSource,
            layer: 'ahn2_05m_ruw',
        },
    };

    async getLayerNames() {
        return Object.keys(this.basemaps);
    }

    async getLayer(name: string) {
        const basemap = this.basemaps[name];

        if (!basemap) {
            throw new Error(`Layer ${name} not available`);
        }

        const layer = (await basemap.source.getLayer(basemap.layer)) as WMTSLayer;

        // Change preview location
        layer.previewSet = 6;
        layer.previewCol = 30;
        layer.previewRow = 32;

        return layer;
    }
}
