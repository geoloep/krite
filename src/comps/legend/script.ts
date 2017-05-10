import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import pool from '../../servicePool';
import { InspectorService } from '../../services/inspector';
import { MapService } from '../../services/map';
import { AppSwitchService } from '../../services/appSwitch';

import { ILayer } from '../../types';

export interface IButtonState {
    icon: string;
    flipable: boolean;
    disabled: boolean;
    hidden: boolean;
    action?: (e: any) => void;
}

let map = pool.getService<MapService>('MapService');
let inspector = pool.getService<InspectorService>('InspectorService');
let sidebar = pool.getService<AppSwitchService>('AppSwitchService');

@Component
export default class App extends Vue {
    items = map.layers;

    buttonStates: { [index: string]: IButtonState[] } = {};
    legendState: { [index: string]: boolean } = {};

    getButtons(name: string) {
        if (!(name in this.buttonStates)) {
            this.$set(this.buttonStates, name, []);

            for (let button of this.bindButtons(name)) {
                this.buttonStates[name].push(button);
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
            console.log(button.disabled);
        }

        if (button.action) {
            button.action(button);
        }
    }

    bindButtons(layerName: string): IButtonState[] {
        return [
            {
                icon: 'angle-double-up',
                flipable: false,
                disabled: false,
                hidden: false,
                action: (e: any) => {
                    let layer = map.layerByName[layerName];
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
            {
                icon: 'question-circle',
                flipable: false,
                disabled: false,
                hidden: true,
                action: (e: IButtonState) => {
                    inspector.layer = map.layerByName[layerName];
                    sidebar.setApp('InspectorApp');
                },
            },
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
    };
};
