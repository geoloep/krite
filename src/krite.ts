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

import { ServicePool } from './pools/services';
import { SourcePool } from './pools/sources';

import { MapService } from './services/map';

import WebMercator from './crs/4326+3857';

import { IDataSource, IService, ICRS } from './types';

export interface IKriteOptions {
    crs: ICRS,
}

export class Krite {
    service: ServicePool;
    source: SourcePool;

    crs: ICRS = new WebMercator();

    constructor(options?: IKriteOptions) {
        Object.assign(this, options);

        this.service = new ServicePool(this);
        this.source = new SourcePool(this);
    }

    get addServices() {
        return this.service.addServices;
    }

    get addService() {
        return this.service.add;
    }

    get getService() {
        return this.service.get;
    }

    get tryService() {
        return this.service.try;
    }

    get promiseService() {
        return this.service.promise;
    }

    get hasService() {
        return this.service.has;
    }

    get addSources() {
        return this.source.addSources;
    }

    get addSource() {
        return this.source.add;
    }

    get getSource() {
        return this.source.get;
    }

    get trySource() {
        return this.source.try;
    }

    get promiseSource() {
        return this.source.promise;
    }

    get hasSource() {
        return this.source.has;
    }

    /**
     * Shortcut to the MapService
     */
    get map() {
        if (!this.service.has('MapService')) {
            throw new Error('Requesting map before MapService is available.');
        }

        return this.service.get<MapService>('MapService');
    }
}

export default Krite;
