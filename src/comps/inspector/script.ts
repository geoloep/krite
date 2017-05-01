import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import BoxTool from './tools/box.vue';
import NoneTool from './tools/none.vue';
import PointTool from './tools/point.vue';
import PolygonTool from './tools/polygon.vue';
import PolylineTool from './tools/polyline.vue';

import pool from '../../servicePool';
import { AppSwitchService } from '../../services/appSwitch';
import { DrawService } from '../../services/draw';
import { InspectorService } from '../../services/inspector';
import { MapService } from '../../services/map';
import { NumeralService } from '../../services/numeral';

import { ILayer, ILayerClickHandler } from '../../types';

let map = pool.getService<MapService>('MapService');
let service = pool.getService<InspectorService>('InspectorService');
let draw = pool.getService<DrawService>('DrawService');
let numeral = pool.getService<NumeralService>('NumeralService');
let sidebar = pool.tryService<AppSwitchService>('AppSwitchService');

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
    // Layer
    layer = '';
    layers = map.layers;

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

    @Prop({ default: true })
    inserted: boolean;

    mounted() {
        map.onClick(this.onClick);
        map.onLayerClick(this.onLayerClick);

        map.map.on('keypress', this.escape);
    }

    /**
     * Check if component is under a krite VueApp and then if that app is inserted or not
     */
    get partentInserted() {
        if (this.$parent && this.$parent.$props.isapp) {
            return this.$parent.$props.inserted;
        } else {
            return true;
        }
    }

    @Watch('layer')
    onLayerChanged(layer: string) {
        map.hideHighlight();
        // @todo: Should also reset index

        if (map.hasLayerByName(layer)) {
            service.layer = map.layerByName[layer];
            this.allowed = true;
            this.error = false;

            // Check if we can inspect the new layer
            if (service.layer && ((service.layer.hasOperations && service.layer.intersectsPoint) || service.layer.hasOnClick)) {

                // Check if we can inspect using shapes or only point inspect is possible
                if (service.layer.hasOperations && service.layer.intersects) {
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

            draw.disable();
            map.endInspect();
        }
    }

    @Watch('index')
    onIndexChanged() {
        if (this.features.length > 1 && this.features[this.index]) {
            map.addFocus(this.features[this.index]);
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

        draw.disable();
        map.endInspect();

        if (name === 'point') {
            map.startInspect();
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
        if (this.partentInserted && event.code === 'Escape') {
            draw.disable();
            this.modeSelect('point');
        }
    }

    startShapeSelect() {
        draw.disable();
        this.shapeSelect();
    }

    async shapeSelect() {
        switch (this.modename) {
            case 'box':
                this.intersect(await draw.rectangle());
                break;
            case 'tpolygon':
                this.intersect(await draw.polygon());
                break;
            case 'tpolyline':
                this.intersect(await draw.polyline());
                break;
            default:
                break;
        }
    }

    async intersect(feature: GeoJSON.Feature<GeoJSON.GeometryObject>) {
        if (service.layer && service.layer.hasOperations && service.layer.intersects) {
            try {
                this.loadFeatureCollection(await service.layer.intersects(feature));
            } catch (e) {
                console.error(e);
            }
        }
    }

    loadFeatureCollection(collection: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>) {
        this.resetIndex();

        for (let feature of collection.features) {
            this.features.push(feature);
        }

        if (this.features.length > 0) {
            map.addHighlight(collection);

            if (this.features.length > 1) {
                map.addFocus(this.features[this.index]);
            }

            this.namefield = Object.keys(this.features[0].properties)[0];
        } else {
            map.hideHighlight();
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
        map.hideHighlight();
    }

    get fillTable(): any[] {
        if (this.features[this.index]) {
            let properties = this.features[this.index].properties;
            let table: any[] = [];

            if (properties) {

                if (service.layer.getType) {
                    for (let key of Object.keys(properties)) {
                        let type = service.layer.getType(key);
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
                                    f = numeral.float(properties[key]);
                                    break;
                                case 'int':
                                    f = parseInt(properties[key]).toString();
                                    break;
                                case 'percentage':
                                    f = numeral.percentage(properties[key]);
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
                    for (let key of Object.keys(properties)) {
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
    async onClick (point: L.Point) {
        if (this.modename === 'point' && this.partentInserted && service.layer.hasOperations && service.layer.intersectsPoint) {
            try {
                this.loadFeatureCollection(await service.layer.intersectsPoint(point));
            } catch (e) {
                console.error(e);
                this.error = true;
            }
        }
    }

    /**
     * Handle click events fired by clicking on a specific marker. Ignore if we're drawing inspection shapes
     */
    onLayerClick (layer: ILayer, attr: any) {
        if (this.modename === 'point' && this.partentInserted && service.layer && layer.name === service.layer.name) {
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
        } else if (!(this.partentInserted) && sidebar) {
            this.layer = layer.name;

            sidebar.setApp('InspectorApp');
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
    }
}
