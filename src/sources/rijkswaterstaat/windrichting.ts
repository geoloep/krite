import * as L from 'leaflet';
import * as rd from 'leaflet-rd';

import pool from '../../servicePool';
import { NumeralService } from '../../services/numeral';

import { ILayer, ILayerClickHandler, TAttributes, IAttributeTypeFunc } from '../../types';

export class WindrichtingLayer implements ILayer {
    group: L.FeatureGroup;
    onClickCallbacks: ILayerClickHandler[] = [];

    private _legend: string;

    private attrTypes: {[index: string]: TAttributes | IAttributeTypeFunc} = {
        locatienaam: 'string',
        loc: 'string',
        net: 'string',
        waarde: 'int',
        eenheid: 'string',
        iconsubscript: 'string',
        ids: 'string',
    };


    constructor(readonly capabilities: any) {
    }

    get hasOnClick() {
        return true;
    }

    get name() {
        return 'Actuele Windrichting';
    }

    get title() {
        return 'Actuele Windrichting';
    }

    get abstract() {
        return '';
    }

    get bounds() {
        return this.group.getBounds();
    }

    get preview() {
        return '<p>Actuele Windrichting Rijkswaterstaat</p>';
    }

    get leaflet() {
        if (!(this.group)) {
            this.group = this.makeLayer();
        }
        return this.group;
    }

    get legend() {
        return '<p><span class="fa fa-long-arrow-up" style="transform: rotate(90deg)"></span></p>';
    }

    onClick(fun: ILayerClickHandler) {
        this.onClickCallbacks.push(fun);
    }

    getType(attr: string): TAttributes | IAttributeTypeFunc {
        if (attr in this.attrTypes) {
            return this.attrTypes[attr];
        } else {
            return 'skip';
        }
    }

    private makeLayer() {
        let layers: L.Layer[] = [];

        for (let feature of this.capabilities.features) {
            if (feature.parameternaam === 'Windrichting' && feature.location) {

                let layer = L.marker(rd.projection.unproject(L.point([feature.location.lon, feature.location.lat])), {
                    icon: L.divIcon({
                        className: '',
                        html: `<span class="fa fa-long-arrow-down" style="transform: rotate(${feature.waarde}deg)"></span>`,
                        iconAnchor: [2.9, 8.5],
                    }),
                });

                layer.on('click', (e) => {
                    this.clickHandler(feature);
                });

                layers.push(layer);
            }
        }

        this.group = L.featureGroup(layers);

        return this.group;
    }

    private clickHandler(feature: any) {
        for (let callback of this.onClickCallbacks) {
            callback(this, feature);
        }
    };
}
