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

import Krite from './krite';

import * as services from './services/index';
import * as sources from './sources/index';

export { ServicePool } from './pools/services';
export { SourcePool } from './pools/sources';
export { MapService } from './services/map';
export { IDataSource, IService } from './types';

export class KriteStandalone extends Krite {
    static services = services;
    static sources = sources;
}
