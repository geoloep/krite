import url from '../../util/url';

import { ILayer } from '../../types';

import { geomToGml } from 'geojson-to-gml-3';
import { GeoJSON, Point } from 'leaflet';

import { XMLService } from '../../services/xml';
import { IOWSLayeroptions } from './source';
import LayerBase from '../../bases/layer';

interface LayerOptions {
    unit: string;
    withinDistance: number;
}

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
    private isPoint!: boolean;

    constructor(private baseUrl: string, private node: Node, options?: IOWSLayeroptions) {
        super();

        this.root = new XMLService(node);
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

    async filter(options: {
        id?: string,
        filters?: { [index: string]: string | null | number },
        properties?: string[],
    }) {
        const query: any = {
            outputformat: 'application/json',
            request: 'GetFeature',
            service: 'WFS',
            typenames: this.name,
            version: '2.0.0',
        };

        if (options.id) {
            query.featureID = options.id;
        }

        if (options.filters) {
            query.filter = '<Filter><AND>' + Object.entries(options.filters).map(([key, value]) => {
                if (value === null) {
                    throw new Error('Filtering nillable fields not yet supported');
                } else {
                    return `<PropertyIsEqualTo><PropertyName>${key}</PropertyName><Literal>${value}</Literal></PropertyIsEqualTo>`;
                }
            }).join('') + '</AND></Filter>';
        }

        if (options.properties) {
            query.propertyName = '';

            for (const property of options.properties) {
                query.propertyName += property + ',';
            }
        }

        const response = await this.fetch(this.baseUrl + url.format({
            query,
        }));

        if (!response.ok) {
            throw new Error(`Filter operation on layer ${this.name} failed`);
        }

        return await response.json();
    }

    async intersects(feature: GeoJSON.Feature | GeoJSON.GeometryObject) {
        if (feature.type === 'Feature') {
            feature = feature.geometry;
        }

        const gml = geomToGml(feature);
        const fieldname = await this.getGeomField();

        const response = await this.fetch(this.baseUrl + url.format({
            query: {
                filter: `<Filter><Intersects><PropertyName>${fieldname}</PropertyName>${gml}</Intersects></Filter>`,
                outputformat: 'application/json',
                request: 'GetFeature',
                service: 'WFS',
                typenames: this.name,
                version: '2.0.0',
            },
        }));

        if (!response.ok) {
            throw new Error(`Spatial operation on layer ${this.name} failed`);
        }

        return await response.json();
    }

    async intersectsPoint(point: Point) {
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

        const response = await this.fetch(this.baseUrl + url.format({
            query: {
                filter,
                outputformat: 'application/json',
                request: 'GetFeature',
                service: 'WFS',
                typenames: this.name,
                version: '2.0.0',
            },
        }));

        if (!response.ok) {
            throw new Error(`Spatial operation on layer ${this.name} failed`);
        }

        return await response.json();
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
    private async getGeomField() {
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
    private async describeFeatureType() {
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
