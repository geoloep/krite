import * as Ractive from 'ractive';

import { RactiveApp } from '../ractiveApp';

import pool from '../../servicePool';
import { MapService } from '../../services/map';
import { InspectorService } from '../../services/inspector';
import { SidebarService } from '../../services/sidebar';
import { NumeralService } from '../../services/numeral';

import { ILayer, ILayerClickHandler, IContainer } from '../../types';

export class InspectorApp extends RactiveApp {
    private visible = false;
    private map = pool.getService<MapService>('MapService');

    private service = pool.getService<InspectorService>('InspectorService');
    private numeral = pool.getService<NumeralService>('NumeralService');
    private sidebar = pool.tryService<SidebarService>('SidebarService');

    private active = false;

    constructor(readonly element?: IContainer | string) {
        super();
        super.init(element);

        this.map.onClick(this.onClick);
        this.map.onLayerClick(this.onLayerClick);
    };

    onClick = (point: L.Point) => {
        if (this.active && this.visible && this.service.layer.canGetInfoAtPoint && this.service.layer.getInfoAtPoint) {
            this.service.layer.getInfoAtPoint(point)
            .then(
                (data: any) => {
                    if (data.totalFeatures > 0) {
                        let feature = data.features[0];

                        this.map.addHighlight(feature);
                        this.showTable(feature.properties);
                    }
                }
            )
            .catch(
                (reason) => {
                    this.ractive.set('error', true);
                }
            );
        }
    }

    onLayerClick: ILayerClickHandler  = (layer: ILayer, attr: any) => {
        if (this.visible && this.service.layer && layer.name === this.service.layer.name) {
            this.showTable(attr);
        } else if (!(this.visible) && this.sidebar) {
            // Klikken op vectorlagen altijd mogelijk maken
            this.service.layer = layer;
            this.sidebar.setApp('InspectorApp');
            this.showTable(attr);
        }
    }

    show = (data: any) => {
        if (data.totalFeatures > 0) {
            let feature = data.features[0];

            this.map.addHighlight(feature);
            this.showTable(feature.properties);
        }
    };

    showTable(properties: {[index: string]: any}) {
        if (this.service.layer.getType) {
            let typeProperties: {[index: string]: any} = {};

            for (let key of Object.keys(properties)) {
                let type = this.service.layer.getType(key);
                let f: string | undefined;

                if (typeof(type) === 'function') {
                    f = type(properties[key]);
                } else {
                    switch (type) {
                        case 'href':
                            let desc: string;
                            if (properties[key].length > 30) {
                                desc = properties[key].substring(0, 30) + '...';
                            } else {
                                desc = properties[key];
                            }

                            f = `<a href="${properties[key]}" target="_blank">${desc}</a>&nbsp;<span class="fa fa-external-link"></span>`;
                            break;
                        case 'float':
                            f = this.numeral.float(properties[key]);
                            break;
                        case 'int':
                            f = parseInt(properties[key]).toString();
                            break;
                        case 'percentage':
                            f = this.numeral.percentage(properties[key]);
                            break;
                        case 'skip':
                            f = undefined;
                            break;
                        default:
                            f = properties[key];
                    }
                }

                if (f) {
                    typeProperties[key] = f;
                }
            }

            this.ractive.set('properties', typeProperties);
        } else {
            this.ractive.set({
                'properties': properties,
            });
        }
        this.ractive.set('error', false);
    };

    insert(element: string | undefined) {
        super.insert(element);

        if (this.ractive) {
            this.ractive.set({layer: this.service.name});
            this.visible = true;
        }

        if (this.active) {
            this.map.startInspect();
            this.map.showHighlight();
        }
    }

    detatch() {
        super.detatch();
        this.visible = false;
        this.map.endInspect();
        this.map.hideHighlight();
    }

    protected createRactive(element: string) {
        this.ractive = new Ractive({
            append: true,
            modifyArrays: true,
            el: element,
            template: require('./template.html'),
            data: {
                layers: this.map.layers,
                layer: this.service.name,
                allowed: false,
                properties: {},
                error: false,
            },
        });

        this.ractive.observe('layer', (n: string) => {
            this.service.layer = this.map.layerByName[n];

            if (this.service.layer && (this.service.layer.canGetInfoAtPoint || this.service.layer.hasOnClick)) {
                this.ractive.set('allowed', true);
                this.ractive.set('error', false);
                this.active = true;
                this.map.startInspect();
            } else {
                this.ractive.set('allowed', false);
                this.active = false;
                this.map.endInspect();
            }
        });
    };
}
