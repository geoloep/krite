import * as L from 'leaflet';

if (!((window as any).L)) {
    (window as any).L = L;
}

import 'leaflet-wfst/dist/Leaflet-WFST.src.js';

import pool from '../../servicePool';
import { MapService } from '../../services/map';
// import { ProjectService } from '../../services/project';

// let map = pool.getService<MapService>('MapService');
// let project = pool.getService<ProjectService>('ProjectService');

import { ILayer, ILayerClickHandler, IProjectionService } from '../../types';

/**
 * This layer is a wrapper around Leaflet-WFST http://flexberry.github.io/Leaflet-WFST/
 */
export class WFSLayer implements ILayer {
    preview = '-';
    legend = '<p>-</p>';
    bounds: undefined;
    hasOnClick = true;
    hasOperations = true;

    abstract = 'WFSLayer';

    _leaflet: L.Layer;

    private onClickCallbacks: ILayerClickHandler[] = [];
    private mapService = pool.getService<MapService>('MapService');
    private projectService = pool.getService<IProjectionService>('ProjectService');

    constructor(readonly options: L.WFSOptions) {
        // this.createLayer();
    }

    get title() {
        return <string> this.options.typeName;
    }

    get name() {
        return <string> this.options.typeName;
    }

    get leaflet() {
        if (!this._leaflet) {
            this.createLayer();
        }

        return this._leaflet;
    }

    async intersects(feature: GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.GeometryObject) {
        const layer: any = L.geoJSON(this.projectService.geoTo(feature));

        // Filter againt the first feature in the GeoJSON feature group
        const filter = new L.Filter.Intersects().append(layer._layers[Object.keys(layer._layers)[0]], <string> this.options.geometryField, this.mapService.map.options.crs);

        const resultLayer: any = new L.WFS(Object.assign(this.options, {
            filter,
        }));

        await new Promise((resolve, reject) => {
            resultLayer.on('load', () => {
                resolve();
            });
            resultLayer.on('error', () => {
                reject();
            });
        });

        return this.projectService.geoFrom((resultLayer as any).toGeoJSON());
    }

    async intersectsPoint(point: L.Point) {
        const layer = L.marker(this.mapService.map.options.crs.unproject(point));

        const filter = new L.Filter.Intersects().append(layer, <string> this.options.geometryField, this.mapService.map.options.crs);

        const resultLayer: any = new L.WFS(Object.assign(this.options, {
            filter,
        }));

        await new Promise((resolve, reject) => {
            resultLayer.on('load', () => {
                resolve();
            });
            resultLayer.on('error', () => {
                reject();
            });
        });

        return this.projectService.geoFrom((resultLayer as any).toGeoJSON());
    }

    async filter(filters: any) {
        const filter = new L.Filter.EQ();

        for (const field in filters) {
            if (filters[field]) {
                filter.append(field, filters[field]);
            }
        }

        const resultLayer: any = new L.WFS(Object.assign(this.options, {
            filter,
        }));

        await new Promise((resolve, reject) => {
            resultLayer.on('load', () => {
                resolve();
            });
            resultLayer.on('error', () => {
                reject();
            });
        });

        return this.projectService.geoFrom((resultLayer as any).toGeoJSON());
    }

    onClick(fun: ILayerClickHandler) {
        this.onClickCallbacks.push(fun);
    }

    private clickHandler(feature: any) {
        for (const callback of this.onClickCallbacks) {
            callback(this, feature);
        }
    }

    private createLayer() {
        this._leaflet = new L.WFS(this.options);

        this._leaflet.on('load', () => {

            (this._leaflet as any).eachLayer((layer: L.Layer) => {
                layer.on('click', () => {
                    this.clickHandler((layer as any).toGeoJSON().properties);
                });
            });
        });
    }
}
