# krite
Krite is a collection of tools for quickly setting up interactive maps. It consists of various generic and reusable components that facilitate various common tasks. For instance:
 
- managing map state
- interacting with the map
- working with projection systems 
- interfacing with data sources.

Krite uses the excellent [Leaflet](https://github.com/Leaflet/Leaflet) library for the actual rendering of the map.

## Structure
The functionality of krite for the most part divided into two parts: services and data sources.

### Services
Most functionality in krite is subdivided into services. These are dependencies that perfom a specific role such as talking to an API or wrapping around external modules.

- LocationService - helper for geolocation
- MapService - wrapper for a Leaflet map
- NominatimService - wrapper for Openstreetmap Nominatim
- PdokLocatieserverService - wrapper for Dutch search service
- XMLService - helper for common xml tasks

### Data Sources
Data sources are connectors for interfacing with geospatial data sources. The included data sources wrap different kinds of web services with the same consistent API. This allows you to combine map data from multiple data sources without worrying about implementation details.

Included in this repository you can find connectors for:

* OGC OWS endpoints (WMS/WFS)
* OGC WMTS
* Geoserver (WMS/WFS using cql_filters)
* ESRI Tiled Map Layers
* Basemaps from the Dutch PDOK
* Openstreetmap

## Installation
```
npm install krite
```

## Usage

A bundle file is provided in `/dist/` but since we don't use it internally it's not properly tested. I recommend you include from `lib` and bundle yourself. 

To create a new krite instance:
```javascript
import Krite from 'krite/lib/krite';

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
krite.getService('DrawService');
krite.tryService('DrawService');
krite.promiseService('DrawService').then((service) => {
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

Interaction
```javascript
krite.map.on('click', (point) => {
    console.log(`Clicked on ${point.x}, ${point.y}`);
});
```

Highlighting
```javascript
krite.map.on('click', async (point) => {
    // You can also get the layer from the source
    const layer = krite.map.getLayer('Countries of the World');
    
    // Point is in the chosen CRS
    const featureCollection = await layer.intersectsPoint(point);
    
    if (featureCollection.features.length > 0) {
        krite.map.highlight(featureCollection.features[0]);
    }
});
```

## More examples

For development and testing purposes there are some examples views in `/views/`. You can run them by starting vite with `vite dev` or `npm run dev` and going to the provided local url.

## Development
Clone this repository and run `npm install`. Run `tsc -d` to compile the typescript source files.

### Used by (in dutch)
[Gratis Kadastrale Kaart](https://perceelloep.nl/)

[Gratis Vastgoedkaart](https://vastgoedloep.nl/)

### License
Krite is licensed under the Apache 2.0 license
