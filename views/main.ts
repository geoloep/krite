import 'leaflet/dist/leaflet.css';
import { nlbasemapsExample } from './examples/nlbasemapsExample';
import { esriExample } from './examples/esriExample';
import {
    geoserverWmsExample,
    geoserverWfsExample,
} from './examples/geoserverExample';
import { owsExample } from './examples/owsExample';
import { wfsExample } from './examples/wfsExample';
import { osmExample } from './examples/osmExample';
import { wmtsExample } from './examples/wmtsExample';

const buttons = document.getElementById('button-container');

const examples = {
    esri: esriExample,
    geoserverWfs: geoserverWfsExample,
    geoserverWms: geoserverWmsExample,
    nlBasemaps: nlbasemapsExample,
    osm: osmExample,
    ows: owsExample,
    wfs: wfsExample,
    wmts: wmtsExample,
};

for (const [key, value] of Object.entries(examples)) {
    const button = document.createElement('button');
    button.innerText = key;
    button.onclick = () => {
        if (buttons) {
            buttons.style.display = 'none';
        }
        value();
    };

    if (buttons) {
        buttons.append(button);
    }
}
