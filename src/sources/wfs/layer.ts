import * as L from 'leaflet';
import * as url from 'url';
import * as wellknown from 'wellknown';

import { WFSSource } from './source';

import { ILayer, ILayerClickHandler } from '../../types';

import pool from '../../servicePool';
import { ProjectService } from '../../services/project';

export class WFSLayer implements ILayer {
    _leaflet: L.GeoJSON;
    _geojson: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>;
    project = pool.getService<ProjectService>('ProjectService');

    private onClickCallbacks: ILayerClickHandler[] = [];

    constructor(readonly capabilities: any, readonly source: WFSSource) {
    };

    get hasOnClick() {
        return true;
    }

    get title() {
        return this.capabilities.Title[0];
    };

    get name() {
        return this.capabilities.Name[0];
    }

    get abstract() {
        return this.capabilities.Abstract[0];
    };

    get bounds(): undefined {
        return undefined;
    }

    get preview() {
        return '<p>' + this.abstract + '</p>';
    };

    get leaflet(): L.Layer {
        if (this._leaflet) {
            return this._leaflet;
        } else {
            this._leaflet = L.geoJSON(undefined, {
                onEachFeature: (feature, layer) => {
                    layer.on('click', () => {
                        this.clickHandler(feature.properties);
                    });
                },
            });
            fetch(this.source.url +
                url.format({
                    query: {
                        service: 'WFS',
                        version: '2.0.0',
                        request: 'GetFeature',
                        typeName: this.name,
                        outputFormat: 'application/json',
                    },
                })).then((response) => {
                    if (response.ok) {
                        response.json().then((json) => {
                            this._leaflet.addData(this.project.to(json));
                        }).catch(() => {
                            console.error('Fout bij parsen GeoJSON WFS');
                        });
                    } else {
                        console.error('Fout bij uitlezen WFS');
                    }
                }).catch((reason) => {
                    console.error('Fout bij verbinden met WFS');
                });

            return this._leaflet;
        }
    };

    get legend() {
        return '-';
    };

    onClick(fun: ILayerClickHandler) {
        this.onClickCallbacks.push(fun);
    }

    private clickHandler(feature: any) {
        for (let callback of this.onClickCallbacks) {
            callback(this, feature);
        }
    };
}
