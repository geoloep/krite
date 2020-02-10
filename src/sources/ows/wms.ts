import Krite from '../../krite';

import { Point, TileLayer } from 'leaflet';
import LayerBase from '../../bases/layer';
import { XMLService } from '../../services/xml';
import { ILayer } from '../../types';
import { IOWSLayeroptions } from './source';
import { WFSLayer } from './wfs';

interface WMSOptions {
    layers: string;
    maxZoom?: number;
    minZoom?: number;
    transparant: boolean;
    zIndex?: number;
}

export class WMSLayer extends LayerBase implements ILayer {
    readonly isWMS = true;

    options!: WMSOptions;

    private root!: XMLService;

    private cache: { [index: string]: any } = {};

    constructor(private url: string, private node: Node, options?: IOWSLayeroptions, private wfs?: WFSLayer) {
        super();

        this.root = new XMLService(node);

        this.options = {
            layers: this.name,
            transparant: true,
        };

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
                layers: this.options.layers,
                transparent: this.options.transparant,
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
        return this.options.zIndex;
    }

    async filter(filters: any) {
        if (!this.wfs) {
            throw new Error('Operations not available on this layer');
        }

        return await this.wfs.filter(filters);
    }

    async intersectsPoint(point: Point) {
        if (!this.wfs) {
            throw new Error('Operations not available on this layer');
        }

        return this.wfs.intersectsPoint(point);
    }

    private cachedProperty(key: string, path: string) {
        if (!this.cache[key]) {
            this.cache[key] = this.root.string(this.node, path);
        }

        return this.cache[key];
    }

}
