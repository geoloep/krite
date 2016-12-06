import * as L from 'leaflet';
import * as rd from 'leaflet-rd';

import { ILayer, ILayerClickHandler, TAttributes, IAttributeTypeFunc } from '../../types';

export class WindsnelheidLayer implements ILayer {
    group: L.FeatureGroup;
    onClickCallbacks: ILayerClickHandler[] = [];

    private _legend: string;

    private attrTypes: {[index: string]: TAttributes | IAttributeTypeFunc} = {
        locatienaam: 'string',
        loc: 'string',
        net: 'string',
        waarde: 'float',
        eenheid: 'string',
        iconsubscript: 'string',
        ids: 'string',
        windkracht: 'int',
    };

    private msToBft = [
        0.3,
        1.6,
        3.4,
        5.5,
        8.0,
        10.8,
        13.9,
        17.2,
        20.8,
        24.5,
        28.5,
        32.7,
    ];

    constructor(readonly capabilities: any) {
    }

    get hasOnClick() {
        return true;
    }

    get name() {
        return 'Actuele Windsnelheid';
    }

    get title() {
        return 'Actuele Windsnelheid';
    }

    get abstract() {
        return '';
    }

    get bounds() {
        return this.group.getBounds();
    }

    get preview() {
        return '<p>Actuele Windsnelheid Rijkswaterstaat</p>';
    }

    get leaflet() {
        if (!(this.group)) {
            this.group = this.makeLayer();
        }
        return this.group;
    }

    get legend() {
        if (this._legend) {
            return this._legend;
        } else {
            this._legend = '<p>';
            for (let i = 0; i < 12; i += 2) {
                this._legend += `<span class="fa-stack fa-lg">
                                    <i class="fa fa-circle fa-stack-1x" style="color: #${this.bftToColour(i)}"></i>
                                    <i class="fa fa-circle-thin fa-stack-1x"></i>
                                </span>&nbsp;&nbsp;Windkracht ${i} - ${i + 1}<br>`;
            }

            this._legend += `<span class="fa-stack fa-lg">
                                    <i class="fa fa-circle fa-stack-1x" style="color: #${this.bftToColour(12)}"></i>
                                    <i class="fa fa-circle-thin fa-stack-1x"></i>
                                </span>&nbsp;&nbsp;Windkracht 12 +</p>`;

            return this._legend;
        }
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

    private bftToColour(bft: number) {
        return bft > 11 ? 'd73027' :
                bft > 9 ? 'fc8d59' :
                bft > 7 ? 'fee08b' :
                bft > 5 ? 'ffffbf' :
                bft > 3 ? 'd9ef8b' :
                bft > 1 ? '91cf60' :
                          '1a9850';
    }

    private makeLayer() {
        let layers: L.Layer[] = [];

        for (let feature of this.capabilities.features) {
            if (feature.parameternaam === 'Windsnelheid' && feature.location    ) {
                let bft: number = 0;
                for (let i = 0; i < this.msToBft.length; i++) {
                    if (parseFloat(feature.waarde) < this.msToBft[i]) {
                        bft = i;
                        feature.windkracht = i;
                        break;
                    }
                }

                let layer = L.marker(rd.projection.unproject(L.point([feature.location.lon, feature.location.lat])), {
                    icon: L.divIcon({
                        className: '',
                        html: `<span class="fa-stack fa-lg">
                            <i class="fa fa-circle fa-stack-1x" style="color: #${this.bftToColour(bft)}"></i>
                            <i class="fa fa-circle-thin fa-stack-1x"></i>
                        </span>`,
                        iconSize: [32, 32],
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
