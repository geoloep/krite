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

import pool from '../servicePool';

import { MapService } from './map';
import { SourceService } from './source';

export class ParameterService {
    parameters: {[index: string]: string} = {};

    constructor() {
        this.parseSearch();
    }

    parseSearch() {
        if (window.location.search.length > 2) {
            const params =  window.location.search.substring(1).split('&');

            for (const param of params) {
                const split = param.split('=');
                if (split.length === 2) {
                    this.parameters[decodeURI(split[0])] = decodeURI(split[1]);
                }
            }
        }
    }

    setLayers() {
        if ('source' in this.parameters && 'layer' in this.parameters) {
            pool.promiseService<SourceService>('SourceService').then((sources) => {
                pool.promiseService<MapService>('MapService').then((map) => {
                    const source = sources.get(this.parameters.source);

                    if (source) {
                        source.getLayer(this.parameters.layer).then((layer) => {
                            map.addLayer(layer);

                            if ('fitBounds' in this.parameters) {
                                map.fitBounds(layer.bounds);
                            }
                        });
                    }
                });
            });
        }
    }
}
