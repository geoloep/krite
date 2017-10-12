[![Build Status](https://travis-ci.org/geoloep/krite.svg?branch=master)](https://travis-ci.org/geoloep/krite)

# krite
Krite is a collection of tools for creating web-based map applications. It mostly consists of wrappers around [Leaflet](https://github.com/Leaflet/Leaflet) and [Vue.js](https://github.com/vuejs/vue). Leaflet is used for creating the map component and Vue.js for rendering the dom of various 'apps'.

The goal of krite is to create a consistent API for interfacing between multiple types of data sources. At the moment krite can consume OWS data sources such as WMS, WMTS and WFS. Support for Arcgis online / ESRI data sources is in the works.

### Demo
View a demo of the krite tookit here: [DEMO](http://demo.geoloep.nl/krite/)

To see how this demo was created you can check out it source code in the following repository: [Demo Source Code](https://github.com/geoloep/krite-example)

### Usage
This project is still under development. If you wan't to give krite a test run there are two options. First of all you'll need to clone this project and run `npm install` to install the required dependencies.

If you want to use krite in a node enviroment you'll have to compile the source files using `npm run lib`. Link the krite folder into your project and require the nessecary classes from '/lib/'. I recommend using typescript when extending krite functionality.

If you want to use krite as an standalone library you can create a bundle by first running `npm run lib` and then `npm run bundle`. Include '/dist/krite.js' in your page, all the functionality of krite will then be available in the global variable 'krite'.

### Development
Clone and install krite as explained above. You can run tests by first creating the bundle file with `npm run bundle` and then running `npm run test`.

### Documentation
[API Documentation](https://geoloep.github.io/krite/index.html)

### Further Examples (in dutch)
[Geoloep Geoviewer](http://kaart.geoloep.nl/)

[Gratis Kadastrale Kaart](http://kadaster.geoloep.nl/)

### License
Krite is licensed under the Apache 2.0 license
