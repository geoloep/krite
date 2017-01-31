import * as L from 'leaflet';

import pool from '../../servicePool';
import { NumeralService } from '../../services/numeral';

import { ILayer, ILayerClickHandler, TAttributes, IAttributeTypeFunc } from '../../types';

export class BuienradarLayer implements ILayer {
    group: L.FeatureGroup;
    onClickCallbacks: ILayerClickHandler[] = [];

    numeral = pool.getService<NumeralService>('NumeralService');

    private floatAttr = [
        'windsnelheidMS',
        'luchtdruk',
        'windrichtingGR',
    ];

    private ignoreAttr = [
        '$',
        'lat',
        'lon',
        'latGraden',
        'lonGraden',
    ];

    private celciusAttr = [
        'temperatuurGC',
        'temperatuur10cm',
    ];

    private percentAttr = [
        'luchtvochtigheid',
    ];

    constructor(readonly capabilities: any) {
    }

    get canGetInfoAtPoint() {
        return false;
    }

    get hasOnClick() {
        return true;
    }

    get name() {
        return 'Actueel weer';
    }

    get title() {
        return 'Actueel weer';
    }

    get abstract() {
        return '';
    }

    get bounds() {
        return this.group.getBounds();
    }

    get preview() {
        return '<img src="http://www.buienradar.nl/resources/images/logor.svg" class="img-responsive">\
        <p>Actuele weersinformatie Buienradar</p>\
        <p>&copy;opyright 2005 - 2016 RTL. Alle rechten voorbehouden</p>\
        <p><a href="http://www.buienradar.nl" target="_blank">http://www.buienradar.nl</a></p>';
    }

    get leaflet() {
        if (!(this.group)) {
            this.group = this.makeLayer();
        }
        return this.group;
    }

    get legend() {
        return '<p><img src="http://xml.buienradar.nl/icons/pp.gif">&nbsp;Weerbeeld</p>';
    }

    onClick(fun: ILayerClickHandler) {
        this.onClickCallbacks.push(fun);
    }

    stationType(naam: any) {
        return naam._;
    }

    celciusType = (getal: any) => {
        return `${this.numeral.float(getal)} &deg;C`;
    }

    icoonType(icoon: any) {
        return `<img src="${icoon._}">`;
    }

    msType = (getal: any) => {
        return `${this.numeral.float(getal)} m/s`;
    }

    getType(attr: string): TAttributes | IAttributeTypeFunc {
        // @todo: kan dit niet beter??
        if (attr === 'url') {
            return 'href';
        } else if (this.floatAttr.indexOf(attr) >= 0) {
            return 'float';
        } else if (this.ignoreAttr.indexOf(attr) >= 0) {
            return 'skip';
        } else if (this.celciusAttr.indexOf(attr) >= 0) {
            return this.celciusType;
        } else if (this.percentAttr.indexOf(attr) >= 0) {
            return 'percentage';
        } else if (attr === 'stationnaam') {
            return this.stationType;
        } else if (attr === 'icoonactueel') {
            return this.icoonType;
        } else {
            return 'string';
        }
    }

    private makeLayer() {
        // this.group = L.layerGroup([]);
        let layers: L.Layer[] = [];
        for (let weerstation of this.capabilities.buienradarnl.weergegevens.actueel_weer.weerstations.weerstation) {
            let layer = L.marker([parseFloat(weerstation.latGraden), parseFloat(weerstation.lonGraden)], {
                icon: L.icon({
                    iconUrl: weerstation.icoonactueel._,
                    iconSize: [37, 37],
                }),
            });

            layer.on('click', (e) => {
                this.clickHandler(weerstation);
            });
            layers.push(layer);
        }

        this.group = (L.featureGroup as any)(layers, {
            attribution: 'Buienradar',
        });

        return this.group;
    }

    private clickHandler(weerstation: any) {
        for (let callback of this.onClickCallbacks) {
            callback(this, weerstation);
        }
    };
}
