import * as Ractive from 'ractive';
import { RactiveApp } from '../ractiveApp';

import pool from '../../servicePool';
import { MapService } from '../../services/map';
import { InspectorService } from '../../services/inspector';
import { SidebarService } from '../../services/sidebar';

import { IContainer } from '../../types';

interface IButtonState {
    icon: string;
    flipable: boolean;
    disabled: boolean;
    hidden: boolean;
    action?: (e: any) => void;
}

export class LegendApp extends RactiveApp {
    private map = pool.getService<MapService>('MapService');
    private inspector = pool.getService<InspectorService>('InspectorService');
    private sidebar = pool.getService<SidebarService>('SidebarService');

    private buttonStates: { [index: string]: IButtonState[] } = {};
    private legendState: { [index: string]: boolean} = {};

    constructor(readonly element?: IContainer | string) {
        super();
        super.init(element);
    };

    protected createRactive(element: string) {

        this.ractive = new Ractive({
            magic: true, // @todo: in 0.8.0 weer proberen
            modifyArrays: true,
            el: element,
            template: require('./template.html'),
            partials: {
                button: require('./button.html'),
            },
            data: {
                items: this.map.layers,
                getButtons: (layerName: string): IButtonState[] => {
                    if (!(layerName in this.buttonStates)) {
                        this.buttonStates[layerName] = this.bindButtons(layerName);
                    }
                    return this.buttonStates[layerName];
                },
                legendState: this.legendState,
                getLegendState: (layerName: string, legendState: any): boolean => {
                    if (!(layerName in legendState)) {
                        legendState[layerName] = true;
                    }
                    return legendState[layerName];
                },
            },
        });

        this.ractive.on('bla', (e) => {
            let context: IButtonState = e.get();
            if (context.flipable) {
                e.toggle('disabled');
            }

            if (context.action) {
                context.action(e);
            }
        });

    };

    private bindButtons(layerName: string): IButtonState[] {
        return [
            {
                icon: 'angle-double-up',
                flipable: false,
                disabled: false,
                hidden: false,
                action: (e: any) => {
                    let layer = this.map.layerByName[layerName];
                    this.map.removeLayer(layer);
                    this.map.addLayer(layer);
                },
            },
            {
                icon: 'list',
                flipable: true,
                disabled: false,
                hidden: false,
                action: (e: any) => {
                    this.legendState[layerName] = !(e.get('disabled'));
                    this.ractive.update('legendState'); // @todo: kan dat niet beter?
                },
            },
            {
                icon: 'eye',
                flipable: true,
                disabled: false,
                hidden: false,
                action: (e: any) => {
                    if (e.get('disabled')) {
                        this.map.hideLayer(this.map.layerByName[layerName]);
                    } else {
                        this.map.showLayer(this.map.layerByName[layerName]);
                    }
                },
            },
            {
                icon: 'question-circle',
                flipable: false,
                disabled: false,
                hidden: true,
                action: (e: any) => {
                    this.inspector.layer = this.map.layerByName[layerName];
                    this.sidebar.setApp('InspectorApp');
                },
            },
            {
                icon: 'trash',
                flipable: false,
                disabled: false,
                hidden: true,
                action: (e: any) => {
                    this.map.removeLayer(this.map.layerByName[layerName]);
                },
            },
        ];
    };
};
