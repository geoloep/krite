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

    constructor(private url: string, private node: Node, private options: IOWSLayeroptions = {}, private wfs?: WFSLayer) {
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
