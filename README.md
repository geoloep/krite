[![Build Status](https://travis-ci.org/geoloep/krite.svg?branch=master)](https://travis-ci.org/geoloep/krite)

# krite
Krite is a collection of tools for creating web-based map applications. It mostly consists of wrappers around [Leaflet](https://github.com/Leaflet/Leaflet) and [Ractive.js](https://github.com/ractivejs/ractive). Leaflet is used for creating the map component and Ractive.js for rendering the dom of various 'apps'.

The goal of krite is to create a consistent API for interfacing between multiple types of data sources. At the moment krite can consume OWS data sources such as WMS, WMTS and WFS. Support for Arcgis online / ESRI data sources is in the works.

### Usage
This project is still in it's early stages. For the adventurous there are two ways to make use of krite. First you'll need to clone this project and run `npm install` to install the required dependencies.

If you want to use krite as an standalone module you can create a bundle by running `npm run bundle`. Include '/dist/krite.js' in your page, all the functionality of krite will then be available in the global variable 'krite'.

If you want to use krite in a node enviroment you'll have to compile the source files using `npm run lib`. Link the krite folder into your project and require the nessecary classes from '/lib/'. I recommend using typescript when extending krite functionality.

### Documentation
[API Documentation](https://geoloep.github.io/krite/index.html)

### Examples (in dutch)
[Geoloep Geoviewer](http://kaart.geoloep.nl/)

[Gratis Kadastrale Kaart](http://kadaster.geoloep.nl/)
