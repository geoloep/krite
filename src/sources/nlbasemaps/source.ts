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

import SourceBase from '../../bases/source';
import { WMTSOptions } from '../wmts/layer';
import { WMTSSource } from '../wmts/source';

const pdokLufoSource = new WMTSSource(' https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0');
const pdokBRTASource = new WMTSSource('https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0');
const pdokBGTSource = new WMTSSource('https://service.pdok.nl/lv/bgt/wmts/v1_0');

/**
 * This source is a convenience for adding basemaps relevant to Dutch mapping projects
 */
export class NLBasemapsSource extends SourceBase implements IDataSource {
    basemaps: {
        [index: string]: {
            source: WMTSSource,
            layer: string,
            options?: WMTSOptions,
        },
    } = {
            'pdok/brtachtergrondkaart': {
                source: pdokBRTASource,
                layer: 'standaard',
            },
            'pdok/brtachtergrondkaartgrijs': {
                source: pdokBRTASource,
                layer: 'grijs',
            },
            'pdok/brtachtergrondkaartpastel': {
                source: pdokBRTASource,
                layer: 'pastel',
            },
            'pdok/brtachtergrondkaartwater': {
                source: pdokBRTASource,
                layer: 'water',
            },
            'pdok/bgtstandaard': {
                source: pdokBGTSource,
                layer: 'BGT standaardvisualisatie',
            },
            'pdok/bgtachtergrond': {
                source: pdokBGTSource,
                layer: 'BGT achtergrondvisualisatie',
            },
            'pdok/bgtpastel': {
                source: pdokBGTSource,
                layer: 'BGT pastelvisualisatie',
            },
            'pdok/luchtfoto_actueel_hr': {
                source: pdokLufoSource,
                layer: 'Luchtfoto Actueel Ortho 8cm RGB',
                options: {
                    maxNativeZoom: 14,
                }
            },
            'pdok/luchtfoto_actueel': {
                source: pdokLufoSource,
                layer: 'Luchtfoto Actueel Ortho 25cm RGB',
                options: {
                    maxNativeZoom: 14,
                }
            },
            'pdok/luchtfoto_2024_quick': {
                source: pdokLufoSource,
                layer: 'Luchtfoto 2024 Quick Ortho 8cm RGB',
            },
            'pdok/luchtfoto_2024_hr': {
                source: pdokLufoSource,
                layer: 'Luchtfoto 2024 Ortho 8cm RGB',
            },
            'pdok/luchtfoto_2023_hr': {
                source: pdokLufoSource,
                layer: 'Luchtfoto 2023 Ortho 8cm RGB',
            },
            'pdok/luchtfoto_2023': {
                source: pdokLufoSource,
                layer: 'Luchtfoto 2023 Ortho 25cm RGB',
                options: {
                    maxNativeZoom: 14,
                }
            },
            'pdok/luchtfoto_2022_hr': {
                source: pdokLufoSource,
                layer: 'Luchtfoto 2022 Ortho 8cm RGB',
            },
            'pdok/luchtfoto_2021_hr': {
                source: pdokLufoSource,
                layer: 'Luchtfoto 2021 Ortho 8cm RGB',
            },
            'pdok/luchtfoto_2020': {
                source: pdokLufoSource,
                layer: 'Luchtfoto 2020 Ortho 25cm RGB',
                options: {
                    maxNativeZoom: 14,
                }
            },
            'pdok/luchtfoto_2019': {
                source: pdokLufoSource,
                layer: 'Luchtfoto 2019 Ortho 25cm RGB',
                options: {
                    maxNativeZoom: 14,
                }
            },
            'pdok/luchtfoto_2018': {
                source: pdokLufoSource,
                layer: 'Luchtfoto 2018 Ortho 25cm RGB',
                options: {
                    maxNativeZoom: 14,
                }
            },
            'pdok/luchtfoto_2017': {
                source: pdokLufoSource,
                layer: 'Luchtfoto 2017 Ortho 25cm RGB',
                options: {
                    maxNativeZoom: 14,
                }
            },
            'pdok/luchtfoto_2016': {
                source: pdokLufoSource,
                layer: 'Luchtfoto 2016 Ortho 25cm RGB',
                options: {
                    maxNativeZoom: 14,
                }
            },
        };

    async getLayerNames() {
        return Object.keys(this.basemaps);
    }

    async getLayer(name: string, options?: WMTSOptions) {
        const basemap = this.basemaps[name];

        if (!basemap) {
            throw new Error(`Layer ${name} not available`);
        }

        if (basemap.source.added) {
            basemap.source.added(this.krite);
        }

        const layer = await basemap.source.getLayer(basemap.layer, {
            ...(basemap.options || {}),
            ...options,
        });

        // Change preview location
        layer.previewSet = 6;
        layer.previewCol = 30;
        layer.previewRow = 32;

        return layer;
    }
}
