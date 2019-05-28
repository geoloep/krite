/*
Copyright 2019 Geoloep

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import Krite from '../krite';
import { Marker, CircleMarker } from 'leaflet';

/**
 * Service for finding and showing device location on the map
 */
export class LocationService {
    krite!: Krite;

    marker: Marker | CircleMarker = new CircleMarker([0, 0]);

    constructor(marker?: Marker | CircleMarker) {
        if (marker) {
            this.marker = marker;
        }
    }

    added(krite: Krite) {
        this.krite = krite;

        this.setup();
    }

    setup() {
        this.krite.map.leaflet.on('locationfound', (event: any) => {
            this.marker.setLatLng(event.latlng);
        });
    }

    startLocating() {
        this.krite.map.leaflet.locate({
            watch: true,
        });

        this.krite.map.leaflet.once('locationfound', (event: any) => {
            this.krite.map.leaflet.flyToBounds(event.bounds);
            this.marker.setLatLng(event.latlng);
            this.marker.addTo(this.krite.map.leaflet);
        });
    }

    stopLocating() {
        this.krite.map.leaflet.stopLocate();

        this.marker.remove();
    }
}

