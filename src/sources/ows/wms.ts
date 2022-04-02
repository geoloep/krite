/*
Copyright 2022 Geoloep

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

import LayerBase from '../../bases/layer';
import {ILayer} from '../../types';
import {IOWSLayeroptions} from './source';
import {Point, TileLayer} from 'leaflet';
import {WFSLayer} from './wfs';
import {XMLService} from '../../services/xml';

export class WMSLayer extends LayerBase implements ILayer {
    readonly isWMS = true;

    private root!: XMLService;

    private cache: { [index: string]: any } = {};

    constructor(protected url: string, protected node: Node, protected options: IOWSLayeroptions = {}, protected wfs?: WFSLayer) {
        super();

        this.root = new XMLService(node);

        if (this.options) {
            Object.assign(this.options, options);
        }
    }

    get hasOperations() {
        return Boolean(this.wfs);
    }

    get title() {
        return this.cachedProperty('title', './wms:Title');
    }

    get name() {
        return this.cachedProperty('name', './wms:Name');
    }

    get abstract() {
        return this.cachedProperty('abstract', './wms:Abstract');
    }

    get preview() {
        throw new Error('Preview not yet implemented');
        return '';
    }

    get legend() {
        throw new Error('Legend not yet implemented');
        return '';
    }

    get leaflet() {
        if (!this.cache.leaflet) {
            this.cache.leaflet = new TileLayer.WMS(this.url, {
                format: 'image/png',
                ...this.options.wms,
                layers: this.options.layers || this.name,
            });
        }

        return this.cache.leaflet;
    }

    get bounds() {
        return undefined;
    }

    get minZoom() {
        return this.options.minZoom;
    }

    get maxZoom() {
        return this.options.maxZoom;
    }

    get zIndex() {
        return this.options.wms?.zIndex;
    }

    async filter(filters: any) {
        if (!this.wfs) {
            throw new Error('Operations not available on this layer');
        }

        return await this.wfs.filter(filters);
    }

    async intersects(feature: GeoJSON.Feature | GeoJSON.GeometryObject, parameters?: Record<string, string | number>) {
        if (!this.wfs) {
            throw new Error('Operations not available on this layer');
        }

        return this.wfs.intersects(feature, parameters);
    }
    async intersectsPoint(point: Point, parameters?: Record<string, string | number>) {
        if (!this.wfs) {
            throw new Error('Operations not available on this layer');
        }

        return this.wfs.intersectsPoint(point, parameters);
    }

    private cachedProperty(key: string, path: string) {
        if (!this.cache[key]) {
            this.cache[key] = this.root.string(this.node, path);
        }

        return this.cache[key];
    }

}
