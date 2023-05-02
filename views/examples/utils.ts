import Krite from '@/krite';

import { MapService } from '@/services';

import RD from '@/crs/28992';
import WebMercator from '@/crs/4326+3857';

const container = document.getElementById('krite-container');
const logContainer = document.getElementById('log-container');

export const createRdMap = () => {
    const krite = new Krite({
        crs: new RD(),
    });

    const map = krite.addService(
        'MapService',
        new MapService({
            leaflet: {
                minZoom: 3,
                maxZoom: 16,
                center: [52.156, 5.389],
                zoom: 3,
            },
        })
    );

    if (container) {
        map.attach(container);
    }

    return krite;
};

export const createWebMercatorMap = () => {
    const krite = new Krite({
        crs: new WebMercator(),
    });

    const map = krite.addService(
        'MapService',
        new MapService({
            leaflet: {
                minZoom: 3,
                maxZoom: 16,
                center: [52.156, 5.389],
                zoom: 3,
            },
        })
    );

    if (container) {
        map.attach(container);
    }

    return krite;
};

export const addToLog = (message: string) => {
    const box = document.createElement('div');
    box.innerText = message;

    if (logContainer) {
        logContainer.prepend(box);
    }
};

export const createTable = (headers: string[]) => {
    const tableElement = document.createElement('table');
    const tableHead = document.createElement('thead');
    const tableBody = document.createElement('tbody');

    for (const header of headers) {
        const th = document.createElement('th');
        th.innerText = header;
        tableHead.append(th);
    }

    tableElement.append(tableHead);
    tableElement.append(tableBody);

    return [tableElement, tableBody];
};
