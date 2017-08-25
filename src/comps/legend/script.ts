import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import pool from '../../servicePool';
import { AppSwitchService } from '../../services/appSwitch';
import { InspectorService } from '../../services/inspector';
import { MapService } from '../../services/map';

import { ILayer } from '../../types';

export interface IButtonState {
    icon: string;
    flipable: boolean;
    disabled: boolean;
    hidden: boolean;
    action?: (e: any) => void;
}

const map = pool.getService<MapService>('MapService');
const inspector = pool.tryService<InspectorService>('InspectorService');
const sidebar = pool.tryService<AppSwitchService>('AppSwitchService');

@Component
export default class App extends Vue {
    items = map.layers;

    buttonStates: { [index: string]: IButtonState[] } = {};
    legendState: { [index: string]: boolean } = {};

    @Prop()
    locale: any;

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
                    const layer = map.layerByName[layerName];
                    map.removeLayer(layer);
                    map.addLayer(layer);
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
                        map.hideLayer(map.layerByName[layerName]);
                    } else {
                        map.showLayer(map.layerByName[layerName]);
                    }
                },
            },
            inspector ? {
                icon: 'question-circle',
                flipable: false,
                disabled: false,
                hidden: true,
                action: (e: IButtonState) => {
                    if (inspector && sidebar) {
                        inspector.layer = map.layerByName[layerName];
                        sidebar.setApp('InspectorApp');
                    }
                },
            } : false,
            {
                icon: 'trash',
                flipable: false,
                disabled: false,
                hidden: true,
                action: (e: IButtonState) => {
                    map.removeLayer(map.layerByName[layerName]);
                },
            },
        ];
    }
}
