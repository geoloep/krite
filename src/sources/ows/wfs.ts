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


import url from '../../util/url';

import {ILayer} from '../../types';

import {geomToGml} from 'geojson-to-gml-3';
import {GeoJSON, Point} from 'leaflet';

import {XMLService} from '../../services/xml';
import {IOWSLayeroptions} from './source';
import LayerBase from '../../bases/layer';

// interface LayerOptions {
//     unit: string;
//     withinDistance: number;
// }

export class WFSLayer extends LayerBase implements ILayer {
    readonly isWFS = true;

    hasOperations = true;

    withinDistance = 5;
    unit = 'meters';

    private root!: XMLService;
    private types!: XMLService;

    private cache: { [index: string]: any } = {};

    private layer!: GeoJSON;
    private geomField!: string;
    protected isPoint!: boolean;

    constructor(protected baseUrl: string, protected node: Node, _options?: IOWSLayeroptions) {
        super();

        this.root = new XMLService(node);
    }

    get title() {
        return this.cachedProperty('title', './wfs:Title');
    }

    get name() {
        return this.cachedProperty('name', './wfs:Name');
    }

    get abstract() {
        return this.cachedProperty('abstract', './wfs:Abstract');
    }

    get preview() {
        return '-';
    }

    get legend() {
        return '<p>-</p>';
    }

    get leaflet() {
        if (!this.layer) {
            this.layer = new GeoJSON(undefined, {
                onEachFeature: (feature, layer) => {
                    layer.on('click', () => {
                        this.emit('click', this, feature.properties);
                    });
                },
            });

            // @todo: implement loadData
        }

        return this.layer;
    }

    get bounds() {
        return undefined;
    }

    async request(parameters: Record<string, any>) {
        const response = await this.fetch(this.baseUrl + url.format({
            query: {
                service: 'WFS',
                typenames: this.name,
                version: '2.0.0',
                outputformat: 'application/json',
                ...parameters
            }
        }))

        if (!response.ok) {
            throw new Error('Response of WFS request not ok')
        }

        try {
            return await response.json();
        } catch (e) {
            throw new Error('Could not decode WFS request response')
        }
    }

    async filter(options: {
        id?: string,
        filters?: { [index: string]: string | null | number },
        properties?: string[],
    }) {
        const query: any = {
            request: 'GetFeature',
        };

        if (options.id) {
            query.featureID = options.id;
        }

        if (options.filters) {
            let wrapStart: string;
            let wrapEnd: string;

            if (Object.keys(options.filters).length > 1) {
                [wrapStart, wrapEnd] = ['<And>', '</And>'];
            } else {
                [wrapStart, wrapEnd] = ['', ''];
            }

            query.filter = `<Filter>${wrapStart}` + Object.entries(options.filters).map(([key, value]) => {
                if (value === null) {
                    return `<PropertyIsNull><PropertyName>${key}</PropertyName></PropertyIsNull>`;
                } else {
                    return `<PropertyIsEqualTo><PropertyName>${key}</PropertyName><Literal>${value}</Literal></PropertyIsEqualTo>`;
                }
            }).join('') + `${wrapEnd}</Filter>`;
        }

        if (options.properties) {
            query.propertyName = '';

            for (const property of options.properties) {
                query.propertyName += property + ',';
            }
        }

        try {
            return this.request(query)
        } catch (e) {
            throw new Error(`Filter operation on layer ${this.name} failed`);
        }
    }

    async intersects(feature: GeoJSON.Feature | GeoJSON.GeometryObject, parameters: Record<string, string | number> = {}) {
        if (feature.type === 'Feature') {
            feature = feature.geometry;
        }

        const gml = geomToGml(feature);
        const fieldname = await this.getGeomField();

        try {
            return await this.request({
                filter: `<Filter><Intersects><PropertyName>${fieldname}</PropertyName>${gml}</Intersects></Filter>`,
                request: 'GetFeature',
                ...parameters
            })
        } catch (e) {
            throw new Error(`Spatial operation on layer ${this.name} failed`);
        }
    }

    async intersectsPoint(point: Point, parameters: Record<string, string | number> = {}) {
        const fieldname = await this.getGeomField();

        let filter: string;

        // Points are impossible to click, use Within in stead. Withindistance has to become dynamic in the future,
        // as does the unit...
        if (this.isPoint) {
            // filter = `DWITHIN(${fieldname}, POINT(${point.x} ${point.y}), ${this.withinDistance}, ${this.unit})`;
            throw new Error('Intersection for points not yet implemented');
        } else {
            filter = `<Filter><Intersects><PropertyName>${fieldname}</PropertyName><gml:Point><gml:coordinates>${point.x} ${point.y}</gml:coordinates></gml:Point></Intersects></Filter>`;
        }

        try {
            return await this.request({
                filter,
                request: 'GetFeature',
                ...parameters
            })
        } catch (e) {
            throw new Error(`Spatial operation on layer ${this.name} failed`);
        }
    }

    private cachedProperty(key: string, path: string) {
        if (!this.cache[key]) {
            this.cache[key] = this.root.string(this.node, path);
        }

        return this.cache[key];
    }

    /**
     * This function determines the fieldname of the geometry of the layer, it is needed for making spatial querys
     */
    protected async getGeomField() {
        if (!this.geomField) {
            if (!this.types) {
                await this.describeFeatureType();
            }

            // Will always pick the first gml-node
            const gmlnode = this.types.node(this.types.document, '//xsd:element[starts-with(@type, \'gml\')][1]');

            if (gmlnode.snapshotLength > 0) {
                this.geomField = this.types.string(gmlnode.snapshotItem(0) as Node, './@name');

                this.isPoint = (this.types.string(gmlnode.snapshotItem(0) as Node, './@type').indexOf('Point') !== -1);
            } else {
                console.warn(`Trying default fieldname for the geometry field of ${this.title}`);
                this.geomField = 'geom';
            }
        }

        return this.geomField;
    }

    /**
     * This function performs a WFS Describefeature request for the relevant layer and saves the resulting document
     */
    protected async describeFeatureType() {
        if (!this.types) {
            const response = await this.fetch(this.baseUrl +
                url.format({
                    query: {
                        request: 'DescribeFeatureType',
                        service: 'WFS',
                        version: '2.0.0',
                        typename: this.name,
                    },
                }));

            if (!response.ok) {
                throw new Error(`Response from ${response.url} not ok`);
            }

            this.types = new XMLService(await response.text());
        }

        return this.types;
    }
}
