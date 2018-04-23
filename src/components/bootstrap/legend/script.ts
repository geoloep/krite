import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import pool from '../../../servicePool';
import { InspectorService } from '../../../services/inspector';
import { MapService } from '../../../services/map';

import { ILayer } from '../../../types';

import en from './locales/en_gb';

export interface IButtonState {
    icon: string;
    flipable: boolean;
    disabled: boolean;
    hidden: boolean;
    action?: (e: any) => void;
}

@Component
export default class App extends Vue {
    map: MapService;
    inspector: InspectorService | undefined;

    items = this.map.layers;

    buttonStates: { [index: string]: IButtonState[] } = {};
    legendState: { [index: string]: boolean } = {};

    @Prop({default: () => en})
    locale: any;

    beforeCreate() {
        this.map = pool.getService<MapService>('MapService');
    }

    created() {
        this.inspector = pool.tryService<InspectorService>('InspectorService');
    }

    getButtons(name: string) {
        if (!(name in this.buttonStates)) {
            this.$set(this.buttonStates, name, []);

            for (const button of this.bindButtons(name)) {
                if (button) {
                    this.buttonStates[name].push(button);
                }
            }
        }
        return this.buttonStates[name];
    }

    getLegendState(name: string) {
        if (!(name in this.legendState)) {
            this.legendState[name] = true;
        }
        return this.legendState[name];
    }

    buttonClick(button: IButtonState) {
        if (button.flipable) {
            button.disabled = !button.disabled;
        }

        if (button.action) {
            button.action(button);
        }
    }

    bindButtons(layerName: string): Array<IButtonState | false> {
        return [
            {
                icon: 'angle-double-up',
                flipable: false,
                disabled: false,
                hidden: false,
                action: (e: any) => {
                    const layer = this.map.layerByName[layerName];
                    this.map.removeLayer(layer);
                    this.map.addLayer(layer);
                },
            },
            {
                icon: 'list',
                flipable: true,
                disabled: false,
                hidden: false,
                action: (e: IButtonState) => {
                    this.legendState[layerName] = !e.disabled;
                },
            },
            {
                icon: 'eye',
                flipable: true,
                disabled: false,
                hidden: false,
                action: (e: IButtonState) => {
                    if (e.disabled) {
                        this.map.hideLayer(this.map.layerByName[layerName]);
                    } else {
                        this.map.showLayer(this.map.layerByName[layerName]);
                    }
                },
            },
            this.inspector ? {
                icon: 'question-circle',
                flipable: false,
                disabled: false,
                hidden: true,
                action: (e: IButtonState) => {
                    if (this.inspector) {
                        this.inspector.layer = this.map.layerByName[layerName];
                        this.$emit('legend-inspect');
                    }
                },
            } : false,
            {
                icon: 'trash',
                flipable: false,
                disabled: false,
                hidden: true,
                action: (e: IButtonState) => {
                    this.map.removeLayer(this.map.layerByName[layerName]);
                },
            },
        ];
    }
}
