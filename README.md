# krite
Krite is a collection of tools for quickly setting up interactive maps. It consist of various generic and reusable components that facilitate various common tasks. Tasks including managing map state, map interaction, working with projection systems and interfacing with data sources.

Krite uses the excellent [Leaflet](https://github.com/Leaflet/Leaflet) library for the actual rendering of the map.

With the help of the [krite-vue](https://github.com/geoloep/krite-vue) project you can quickly create a modern web-based map application. This core repository is framework agnostic and can form the base of your own implementation.

## Structure
The functionality of krite for the most part divided into two parts: services and data sources.

### Services
Most functionality in krite is subdivided into services. These are dependencies that perfom a specific role such as talking to an API or wrapping around external modules.

### Data Sources
Data sources are connectors for interfacing with geospatial data sources. The included data sources wrap differing web services with the same consistent API. They allow you to consume data layers from multiple types of web services in a single application.

Included in this repository you can find connectors for:

* WMS
* WFS
* WMTS
* ESRI Tiled Map Layers

## Installation
```
npm install krite
```

## Usage
Unfortunately detailed docs are not yet available.

Creating a new krite instance:
```javascript
import Krite from 'krite';

const krite = new Krite();
```

Adding services
```javascript
import { InspectorService } from 'krite/lib/services/inspector';

krite.addService('InspectorService', new InspectorService);

// Or
krite.addServices({
    InspectorService: new InspectorService(),
    ...
})
```

Get service instances
```javascript
krite.getService('InspectorService');
krite.tryService('InspectorService');
krite.promiseService('InspectorService').then((service) => {
    // Do something    
});
```

Creating the map
```javascript
krite.addService('MapService', new MapService({
    container: '#map-container',
    leaflet: {
        minZoom: 3,
        maxZoom: 16,
        center: [0, 0],
        zoom: 3,
        preferCanvas: true,
    },
}));
```

Adding data sources
```javascript
import { OWSSource } from 'krite/lib/sources/ows/source';

krite.addSource('Boundless Geoserver', new OWSSource 'https://demo.boundlessgeo.com/geoserver/ows'));

// or
krite.addSources({
    'Boundless Geoserver': new OWSSource('https://demo.boundlessgeo.com/geoserver/ows'),
    ...
})
```

Reading data sources
```javascript
const source = krite.getSource('Boundless Geoserver');

source.getLayerNames().then((names) => {
    console.log(names);
});

source.getLayer('Countries of the World').then((layer) => {
    krite.map.addLayer(layer);
});
```

## Development
Clone this repository and run `npm install`. Run `tsc -d` to compile the typescript source files. The testst are currently not up to date.

### Examples (in dutch)
[Gratis Kadastrale Kaart](https://perceelloep.nl/)

[Gratis Vastgoedkaart](https://vastgoedloep.nl/)

### License
Krite is licensed under the Apache 2.0 license
