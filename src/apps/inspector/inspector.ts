import * as Ractive from 'ractive';

import { RactiveApp } from '../ractiveApp';

import pool from '../../servicePool';
import { MapService } from '../../services/map';
import { InspectorService } from '../../services/inspector';
import { SidebarService } from '../../services/sidebar';
import { DrawService } from '../../services/draw';
import { NumeralService } from '../../services/numeral';

import { ILayer, ILayerClickHandler, IContainer } from '../../types';

export class InspectorApp extends RactiveApp {
    private visible = false;
    private map = pool.getService<MapService>('MapService');

    private service = pool.getService<InspectorService>('InspectorService');
    private numeral = pool.getService<NumeralService>('NumeralService');
    private sidebar = pool.tryService<SidebarService>('SidebarService');
    private draw = pool.tryService<DrawService>('DrawService');

    private active = false;
    private pointInspect = true;

    private features: GeoJSON.Feature<GeoJSON.GeometryObject>[] = [];
    private index = 0;

    constructor(readonly element?: IContainer | string) {
        super();
        super.init(element);

        this.map.onClick(this.onClick);
        this.map.onLayerClick(this.onLayerClick);

        this.map.map.on('keypress', this.escape);
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

    /**
     * Handle click events fired by clicking on the map. Only proceed if we're not drawing other inspection shapes
     */
    onClick = async (point: L.Point) => {
        if (this.pointInspect && this.active && this.visible && this.service.layer.hasOperations && this.service.layer.intersectsPoint) {
            try {
                this.loadFeatureCollection(await this.service.layer.intersectsPoint(point));
            } catch (e) {
                console.error(e);
                this.ractive.set('error', true);
            }
        }
    }

    /**
     * Handle click events fired by clicking on a specific marker. Ignore if we're drawing inspection shapes
     */
    onLayerClick: ILayerClickHandler = (layer: ILayer, attr: any) => {
        if (this.pointInspect && this.visible && this.service.layer && layer.name === this.service.layer.name) {
            this.showTable(attr);
        } else if (!(this.visible) && this.sidebar) {
            // Klikken op vectorlagen altijd mogelijk maken
            this.service.layer = layer;
            this.sidebar.setApp('InspectorApp');
            this.showTable(attr);
        }
    }

    protected createRactive(element: string) {
        this.ractive = new Ractive({
            append: true,
            modifyArrays: true,
            el: element,
            template: require('./template.html'),
            partials: {
                // @todo: better icons
                point: require('./point.html'),
                polyline: require('./polyline.html'),
                box: require('./box.html'),
                polygon: require('./polygon.html'),
            },
            data: {
                mode: 'point',
                modeDropDown: false,
                layers: this.map.layers,
                layer: this.service.name,
                features: this.features,
                feature: '',
                namefield: '',
                allowed: false,
                properties: {},
                error: false,
            },
        });

        this.ractive.observe('layer', (n: string) => {
            this.service.layer = this.map.layerByName[n];
            this.clear();

            if (this.service.layer && ((this.service.layer.hasOperations && this.service.layer.intersectsPoint) || this.service.layer.hasOnClick)) {
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

        this.ractive.on('modeDropDownClick', () => {
            this.toggleModeDropdown();
        });

        this.ractive.on('modeClick', () => {
            if (!this.pointInspect) {
                this.startShapeSelect();
            }
        });

        this.ractive.observe('feature', (n: GeoJSON.Feature<GeoJSON.GeometryObject>) => {
            if (typeof(n) === 'object' && n.properties) {
                this.loadFeature(n);
            } else {
                this.map.hideHighlight();
                this.ractive.set('properties', []);
            }
        });

        this.ractive.on('select-point', () => {
            this.toggleModeDropdown();
            this.ractive.set('mode', 'point');
            this.pointInspect = true;
            if (this.draw) {
                this.draw.disable();
            }
        });

        this.ractive.on('select-box', () => {
            this.toggleModeDropdown();
            this.ractive.set('mode', 'box');
            this.startShapeSelect();
        });

        this.ractive.on('select-polygon', async () => {
            this.toggleModeDropdown();
            this.ractive.set('mode', 'polygon');
            this.startShapeSelect();
        });

        this.ractive.on('select-polyline', async () => {
            this.toggleModeDropdown();
            this.ractive.set('mode', 'polyline');
            this.startShapeSelect();
        });

        this.ractive.on('object-right', () => {
            let index = this.ractive.get('feature')._index + 1;
            if (index >= this.features.length) {
                index = 0;
            }
            this.ractive.set('feature', this.features[index]);
        });

        this.ractive.on('object-left', () => {
            let index = this.ractive.get('feature')._index - 1;
            if (index < 0) {
                index = this.features.length - 1;
            }
            this.ractive.set('feature', this.features[index]);
        });
    };

    private escape = (event: KeyboardEvent) => {
        if (this.active && event.code === 'Escape') {
            this.ractive.set('mode', 'point');
            this.pointInspect = true;
            if (this.draw) {
                this.draw.disable();
            }
        }
    }

    private toggleModeDropdown() {
        this.ractive.toggle('modeDropDown');
    }

    private clear() {
        this.map.hideHighlight();
        this.ractive.set('properties', []);
        this.features.splice(0);
    };

    private async intersect(feature: GeoJSON.Feature<GeoJSON.GeometryObject>) {
        if (this.service.layer && this.service.layer.hasOperations && this.service.layer.intersects) {
            try {
                this.loadFeatureCollection(await this.service.layer.intersects(feature));
            } catch (e) {
                console.error(e);
            }
        }
    }

    private loadFeature = (feature: GeoJSON.Feature<GeoJSON.GeometryObject>) => {
        this.showTable(feature.properties);
        this.index = (feature as any)._index;

        if (this.features.length > 1) {
            this.map.addFocus(feature);
        }
    };

    private loadFeatureCollection = (collection: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>) => {
                // Reset inspector state
                this.index = 0;
                this.features.splice(0);

                for (let i = 0; i < collection.features.length; i++) {
                    let feature = (collection.features[i] as any); // @todo: type aanpassen
                    feature._index = i;
                    this.features.push(feature);
                }

                if (this.features.length > 0) {
                    this.map.addHighlight(collection);

                    // Load first feature
                    // this.loadFeature(this.features[0]);
                    this.ractive.set('feature', this.features[0]);

                    // Set the field to name features with
                    // @todo: allow layers to provide the namefield
                    this.ractive.set('namefield', Object.keys(this.features[0].properties)[0]);
                } else {
                    this.map.hideHighlight();
                }
    };

    private startShapeSelect() {
        if (this.draw) {
            this.draw.disable();

            if (this.pointInspect) {
                this.pointInspect = false;
            }

            this.shapeSelect();
        }
    };

    private async shapeSelect() {
        if (this.draw) {
            switch (this.ractive.get('mode')) {
                case 'box':
                    this.intersect(await this.draw.rectangle());
                    break;
                case 'polygon':
                    this.intersect(await this.draw.polygon());
                    break;
                case 'polyline':
                    this.intersect(await this.draw.polyline());
                    break;
                default:
                    break;
            }
        }
    };

    private showTable(properties: {[index: string]: any}) {
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
        this.ractive.update('properties'); // @todo: uitzoeken waarom dit nodig is
        this.ractive.set('error', false);
    };
}
