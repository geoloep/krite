import * as L from 'leaflet';

if (!((window as any).L)) {
    (window as any).L = L;
}

import 'leaflet-wfst/dist/Leaflet-WFST.src.js';

import pool from '../../servicePool';
import { MapService } from '../../services/map';
import { ProjectService } from '../../services/project';

let map = pool.getService<MapService>('MapService');
let project = pool.getService<ProjectService>('ProjectService');

import { ILayer, ILayerClickHandler } from '../../types';

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

    leaflet: L.Layer;

    private onClickCallbacks: ILayerClickHandler[] = [];

    constructor(readonly options: L.WFSOptions) {
        this.createLayer();
    }

    get title() {
        return <string>this.options.typeName;
    }

    get name() {
        return <string>this.options.typeName;
    }

    async intersects(feature: GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.GeometryObject) {
        let layer: any = L.geoJSON(project.to(feature));

        // Filter againt the first feature in the GeoJSON feature group
        let filter = new L.Filter.Intersects().append(layer._layers[Object.keys(layer._layers)[0]], <string>this.options.geometryField, map.map.options.crs);

        let resultLayer: any = new L.WFS(Object.assign(this.options, {
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

        return project.from((resultLayer as any).toGeoJSON());
    }

    async filter(filters: any) {
        let filter = new L.Filter.EQ();

        for (let field in filters) {
            if (filters[field]) {
                filter.append(field, filters[field]);
            }
        }

        let resultLayer: any = new L.WFS(Object.assign(this.options, {
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

        return project.from((resultLayer as any).toGeoJSON());
    }

    onClick(fun: ILayerClickHandler) {
        this.onClickCallbacks.push(fun);
    }

    private clickHandler(feature: any) {
        for (let callback of this.onClickCallbacks) {
            callback(this, feature);
        }
    };

    private createLayer() {
        this.leaflet = new L.WFS(this.options);

        this.leaflet.on('load', () => {

            (this.leaflet as any).eachLayer((layer: L.Layer) => {
                layer.on('click', () => {
                    this.clickHandler((layer as any).toGeoJSON().properties);
                });
            });
        });
    }
}
