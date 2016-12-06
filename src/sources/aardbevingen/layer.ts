import * as L from 'leaflet';

import { ILayer, ILayerClickHandler, TAttributes, IAttributeTypeFunc } from '../../types';

export class AardbevingLayer implements ILayer {
    group: L.FeatureGroup;
    onClickCallbacks: ILayerClickHandler[] = [];

    private attrTypes: {[index: string]: TAttributes | IAttributeTypeFunc} = {
        Lat: 'float',
        Lon: 'float',
        M: 'float',
        Diepte: (diepte: string) => {
            return diepte.replace('.', ',');
        },
        Link: 'href',
    };

    constructor(readonly capabilities: any) {
    }

    get canGetInfoAtPoint() {
        return false;
    }

    get hasOnClick() {
        return true;
    }

    get name() {
        return 'Recente aardbevingen';
    }

    get title() {
        return 'Recente aardbevingen';
    }

    get abstract() {
        return '';
    }

    get bounds() {
        return this.group.getBounds();
    }

    get preview() {
        return '<p>De meest recente aardbevingen in en rondom Nederland</p>\
        <p>Copyright <a href="http://knmi.nl/" target="_blank">KNMI</a>';
    }

    get leaflet() {
        if (!(this.group)) {
            this.group = this.makeLayer();
        }
        return this.group;
    }

    get legend() {
        return '<p><span class="fa fa-bullseye" style="color: red"></span>&nbsp;Aardbeving</p>';
    }

    onClick(fun: ILayerClickHandler) {
        this.onClickCallbacks.push(fun);
    }
    getType(attr: string): TAttributes | IAttributeTypeFunc {
        if (attr in this.attrTypes) {
            return this.attrTypes[attr];
        } else {
            return 'string';
        }
    }

    private makeLayer() {
        let layers: L.Layer[] = [];

        for (let aardbeving of this.capabilities.rss.channel.item) {
            let layer = L.marker([parseFloat(aardbeving['geo:lat']), parseFloat(aardbeving['geo:lon'])], {
                icon: L.divIcon({
                    className: '',
                    html: '<span class="fa fa-bullseye fa-2x" style="color: red"></span>',
                    iconAnchor: [9, 12],
                }),
            });

            layer.on('click', (e) => {
                this.clickHandler(aardbeving);
            });
            layers.push(layer);
        }

        this.group = L.featureGroup(layers);

        return this.group;
    }

    private parseAttributes(aardbeving: any) {
        let gesplitst = aardbeving.description.split(', ');
        let resultaat: {[index: string]: any} = {
            'Datum': gesplitst[0],
            'Tijd': gesplitst[1],
        };

        for (let i = 2; i < gesplitst.length; i++) {
            let paar = gesplitst[i].split(' = ');
            resultaat[paar[0]] = paar[1];
        }

        resultaat['Link'] = aardbeving.link;
        resultaat['Guid'] = aardbeving.guid;

        return resultaat;
    }

    private clickHandler(aardbeving: any) {
        for (let callback of this.onClickCallbacks) {
            callback(this, this.parseAttributes(aardbeving));
        }
    };
}
