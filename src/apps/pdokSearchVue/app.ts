import * as Vue from 'vue';
import { IContainer } from '../../types';
import { VueApp } from '../vueApp';

import * as wellknown from 'wellknown';

import pool from '../../servicePool';
import { MapService } from '../../services/map';
import { PdokLocatieserverService } from '../../services/pdokLocatieserver';

export class PdokSearchApp extends VueApp {
    name = 'PdokSearchApp';

    protected map: MapService = pool.getService<MapService>('MapService');
    protected locatieserver: PdokLocatieserverService = pool.getService<PdokLocatieserverService>('PdokLocatieserverService');

    protected searchTimeOut: number;

    protected timeOutLength = 500;

    protected diepteNaarZoom: {[index: string]: number} = {
        adres: 12,
        weg: 12,
        woonplaats: 8,
        gemeente: 8,
    };

    protected depthOrder = [
        'adres',
        'woonplaats',
        'weg',
        'gemeente',
    ];

    constructor(element?: IContainer | string) {
        super();
        super.init(element);
    }

    protected createVue(element: string) {
        this.vue = new Vue({
            el: '#' + element,
            data: {
                message: 'Wereld',
            },
            template: '<h1>Hallo {{message}}</h1>',
        });
    }
}
