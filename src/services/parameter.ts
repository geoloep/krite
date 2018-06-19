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

import { Krite } from '../krite';
import { IService } from '../types';

export class ParameterService implements IService {
    parameters: { [index: string]: string } = {};

    private krite: Krite;

    constructor() {
        this.parseSearch();
    }

    added(krite: Krite) {
        this.krite = krite;
    }

    parseSearch() {
        if (window.location.search.length > 2) {
            const params = window.location.search.substring(1).split('&');

            for (const param of params) {
                const split = param.split('=');
                if (split.length === 2) {
                    this.parameters[decodeURI(split[0])] = decodeURI(split[1]);
                }
            }
        }
    }

    async setLayers() {
        if ('source' in this.parameters && 'layer' in this.parameters) {
            if (this.krite.source.has(this.parameters.source)) {
                const layer = await this.krite.getSource(this.parameters.source).getLayer(this.parameters.layer);

                this.krite.map.addLayer(layer);

                if ('fitBounds' in this.parameters) {
                    this.krite.map.fitBounds(layer.bounds);
                }
            }
        }
    }
}
