import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import BoxTool from './tools/box.vue';
import NoneTool from './tools/none.vue';
import PointTool from './tools/point.vue';
import PolygonTool from './tools/polygon.vue';
import PolylineTool from './tools/polyline.vue';

import pool from '../../../servicePool';
import { AppSwitchService } from '../../../services/appSwitch';
import { DrawService } from '../../../services/draw';
import { InspectorService } from '../../../services/inspector';
import { MapService } from '../../../services/map';
import { NumeralService } from '../../../services/numeral';

import { ILayer, ILayerClickHandler } from '../../../types';

import en from './locales/en_gb';

@Component({
    components: {
        none: NoneTool,
        box: BoxTool,
        point: PointTool,
        tpolygon: PolygonTool,
        tpolyline: PolylineTool,
    },
})
export default class InspectorComponent extends Vue {
    map: MapService;
    service: InspectorService;
    draw: DrawService;
    numeral: NumeralService;
    sidebar: AppSwitchService | undefined;

    // Layer
    layer = '';
    layers = this.map.layers;

    allowed = false;
    error = false;

    // Mode
    modename = 'none';
    modeDropDown = false;
    modeShapeAllowed = false;

    // Table / Results
    index = 0;
    namefield = '';
    features: Array<GeoJSON.Feature<GeoJSON.GeometryObject>> = [];

    @Prop({default: () => en})
    locale: any;

    active = false;

    beforeCreate() {
        this.map = pool.getService<MapService>('MapService');
    }

    created() {
        this.service = pool.getService<InspectorService>('InspectorService');
        this.draw = pool.getService<DrawService>('DrawService');
        this.numeral = pool.getService<NumeralService>('NumeralService');
        this.sidebar = pool.tryService<AppSwitchService>('AppSwitchService');
    }

    mounted() {
        this.map.onClick(this.onClick);
        this.map.onLayerClick(this.onLayerClick);

        this.map.map.on('keypress', this.escape);

        if (this.service.layer) {
            this.layer = this.service.layer.name;
        }

        this.service.onChange((layer: ILayer) => {
            this.layer = layer.name;
        });

        this.active = true;
    }

    beforeDestroy() {
        this.active = false;

        this.draw.disable();
        this.map.endInspect();

        this.map.cancelOnClick(this.onClick);
        this.map.cancelOnLayerClick(this.onLayerClick);

        this.map.map.off('keypress', this.escape);
    }

    @Watch('layer')
    onLayerChanged(layer: string) {
        this.map.hideHighlight();
        // @todo: Should also reset index

        if (this.map.hasLayerByName(layer)) {
            this.service.layer = this.map.layerByName[layer];
            this.allowed = true;
            this.error = false;

            // Check if we can inspect the new layer
            if (this.service.layer && ((this.service.layer.hasOperations && this.service.layer.intersectsPoint) || this.service.layer.hasOnClick)) {

                // Check if we can inspect using shapes or only point inspect is possible
                if (this.service.layer.hasOperations && this.service.layer.intersects) {
                    this.modeShapeAllowed = true;

                    // Reset the mode to point, but only if not previously a shapeselect
                    if (this.modename === 'none' || this.modename === 'point') {
                        this.modeSelect('point');
                    }
                } else {
                    this.modeShapeAllowed = false;
                    this.modeSelect('point');
                }
            } else {
                this.allowed = false;
            }
        } else {
            this.allowed = false;
            this.modeShapeAllowed = false;

            this.draw.disable();
            this.map.endInspect();
        }
    }

    @Watch('index')
    onIndexChanged() {
        if (this.features.length > 1 && this.features[this.index]) {
            this.map.addFocus(this.features[this.index]);
        }
    }

    modeDropDownClick() {
        this.modeDropDown = !this.modeDropDown;
    }

    get modeDropDownStyle() {
        if (this.modeDropDown) {
            return 'inherit';
        } else {
            return 'none';
        }
    }

    modeSelect(name: string) {
        this.modename = name;
        this.modeDropDown = false;

        this.draw.disable();
        this.map.endInspect();

        if (name === 'point') {
            this.map.startInspect();
        } else {
            this.modeClick();
        }
    }

    modeClick() {
        if (this.modename !== 'point') {
            this.startShapeSelect();
        }
    }

    escape(event: KeyboardEvent) {
        if (event.code === 'Escape') {
            this.draw.disable();
            this.modeSelect('point');
        }
    }

    startShapeSelect() {
        this.draw.disable();
        this.shapeSelect();
    }

    async shapeSelect() {
        switch (this.modename) {
            case 'box':
                this.intersect(await this.draw.rectangle());
                break;
            case 'tpolygon':
                this.intersect(await this.draw.polygon());
                break;
            case 'tpolyline':
                this.intersect(await this.draw.polyline());
                break;
            default:
                break;
        }
    }

    async intersect(feature: GeoJSON.Feature<GeoJSON.GeometryObject>) {
        if (this.service.layer && this.service.layer.hasOperations && this.service.layer.intersects) {
            try {
                this.loadFeatureCollection(await this.service.layer.intersects(feature));
            } catch (e) {
                throw new Error(e);
            }
        }
    }

    loadFeatureCollection(collection: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>) {
        this.resetIndex();

        for (const feature of collection.features) {
            this.features.push(feature);
        }

        if (this.features.length > 0) {
            this.map.addHighlight(collection);

            if (this.features.length > 1) {
                this.map.addFocus(this.features[this.index]);
            }

            this.namefield = Object.keys(this.features[0].properties)[0];
        } else {
            this.map.hideHighlight();
        }
    }

    shiftIndex(shift: number) {
        if (this.features[this.index + shift]) {
            this.index += shift;
        }
    }

    resetIndex() {
        this.index = 0;
        this.features.splice(0);
        this.map.hideHighlight();
    }

    get fillTable(): any[] {
        if (this.features[this.index]) {
            const properties = this.features[this.index].properties;
            const table: any[] = [];

            if (properties) {

                if (this.service.layer.getType) {
                    for (const key of Object.keys(properties)) {
                        const type = this.service.layer.getType(key);
                        let f: string | undefined;

                        if (typeof (type) === 'function') {
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
                            table.push({
                                key,
                                value: f,
                            });
                        }
                    }
                } else {
                    for (const key of Object.keys(properties)) {
                        table.push({
                            key,
                            value: properties[key],
                        });
                    }
                }

                return table;
            }
        }
        // error = false?
        return [];
    }

    /**
     * Handle click events fired by clicking on the map. Only proceed if we're not drawing other inspection shapes
     */
    async onClick(point: L.Point) {
        if (this.modename === 'point' && this.service.layer.hasOperations && this.service.layer.intersectsPoint) {
            try {
                this.loadFeatureCollection(await this.service.layer.intersectsPoint(point));
            } catch (e) {
                this.error = true;
                throw new Error(e);
            }
        }
    }

    /**
     * Handle click events fired by clicking on a specific marker. Ignore if we're drawing inspection shapes
     */
    onLayerClick(layer: ILayer, attr: any) {
        if (this.modename === 'point' && this.service.layer && layer.name === this.service.layer.name) {
            this.loadFeatureCollection({
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: attr,
                        geometry: {
                            type: 'Point',
                            coordinates: [0, 0],
                        },
                    },
                ],
            });
        }
        // Reactivate at a later point
        /*else if (!(this.partentInserted) && this.sidebar) {
            this.layer = layer.name;

            this.sidebar.setApp('InspectorApp');
            this.loadFeatureCollection({
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: attr,
                        geometry: {
                            type: 'Point',
                            coordinates: [0, 0],
                        },
                    },
                ],
            });
        }*/
    }
}
