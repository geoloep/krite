"use strict";
require("leaflet-towkt");
var L = require("leaflet");
// import * as rd from 'leaflet-rd';
var reproject = require("reproject");
var MapService = (function () {
    function MapService(element, customOptions) {
        var _this = this;
        this.element = element;
        this.customOptions = customOptions;
        this.layers = [];
        this.layerByName = {};
        // Kaartinstellingen
        // private minZoom: number = 3;
        // private maxZoom: number = 16;
        // private initialCenter: [number, number] = [52.156, 5.389];
        // private initialZoom: number = 4;
        this.defaultOptions = {};
        this.clickHandlers = [];
        this.layerClickCallbacks = [];
        this.layerClick = function (layer, attr) {
            for (var _i = 0, _a = _this.layerClickCallbacks; _i < _a.length; _i++) {
                var callback = _a[_i];
                callback(layer, attr);
            }
        };
        this.map = L.map(this.element, Object.assign(this.defaultOptions, this.customOptions));
        this.pointer = L.marker([0, 0]).addTo(this.map);
        this.map.on('click', function (e) {
            for (var _i = 0, _a = _this.clickHandlers; _i < _a.length; _i++) {
                var func = _a[_i];
                func(_this.map.options.crs.project(e.latlng));
            }
        });
        // @todo: is dit element gegarandeerd aanwezig op dit moment?
        this.HTMLElement = document.querySelector('.leaflet-container');
    }
    ;
    // Alleen voor het toevoegen van nieuwe lagen
    MapService.prototype.addLayer = function (layer) {
        if (!(layer.name in this.layerByName)) {
            layer.leaflet.addTo(this.map);
            this.layers.unshift(layer);
            // this.layers.push(layer);
            this.layerByName[layer.name] = layer;
            this.setZIndexes();
            if (layer.onClick) {
                layer.onClick(this.layerClick);
            }
        }
        else {
            console.error('Probeerde een laag met een al in gebruik zijnde naam toe te voegen!');
        }
    };
    ;
    // Verborgen lagen weer zichtbaar maken
    MapService.prototype.showLayer = function (layer) {
        var leaflet = layer.leaflet;
        leaflet.addTo(this.map);
    };
    ;
    MapService.prototype.hasLayerByName = function (name) {
        if (name in this.layers) {
            return true;
        }
        else {
            return false;
        }
    };
    MapService.prototype.hideLayer = function (layer) {
        layer.leaflet.remove();
    };
    ;
    MapService.prototype.onClick = function (fun) {
        this.clickHandlers.push(fun);
    };
    ;
    MapService.prototype.onLayerClick = function (func) {
        this.layerClickCallbacks.push(func);
    };
    MapService.prototype.setZIndexes = function () {
        if (this.layers.length > 0) {
            for (var i = 0; i < this.layers.length; i++) {
                // this.layers[i].leaflet.set
                if (this.layers[i].leaflet.setZIndex) {
                    this.layers[i].leaflet.setZIndex(this.layers.length - i);
                }
            }
        }
        else {
            console.warn('No layers to set a Z-index for');
        }
    };
    // Verwacht vooralsnog geojson in de crs van de WFS
    MapService.prototype.addHighlight = function (geojson, zoomTo) {
        if (zoomTo === void 0) { zoomTo = false; }
        if (this.highlight) {
            this.highlight.remove();
        }
        var reprojected = reproject.toWgs84(geojson, this.map.options.crs.projection.proj4def);
        this.highlight = L.geoJSON(reprojected);
        this.highlight.addTo(this.map);
        if (zoomTo) {
            this.map.fitBounds(this.highlight.getBounds());
        }
    };
    ;
    MapService.prototype.hideHighlight = function () {
        if (this.highlight) {
            this.highlight.remove();
        }
    };
    MapService.prototype.showHighlight = function () {
        if (this.highlight) {
            this.highlight.addTo(this.map);
        }
    };
    // @todo: daadwerkelijk compleet verwijderen?
    MapService.prototype.removeLayer = function (layer) {
        layer.leaflet.remove();
        this.layers.splice(this.layers.indexOf(layer), 1);
        delete this.layerByName[layer.name];
    };
    ;
    MapService.prototype.setBaseMap = function (url, options) {
        if (this.basemap) {
            this.basemap.remove();
        }
        this.basemap = L.tileLayer(url, options);
        this.basemap.setZIndex(-1);
        this.basemap.addTo(this.map);
    };
    ;
    MapService.prototype.startInspect = function () {
        this.HTMLElement.style.cursor = 'help';
    };
    MapService.prototype.endInspect = function () {
        this.HTMLElement.style.cursor = '';
    };
    MapService.prototype.fitBounds = function (bounds) {
        if (bounds) {
            this.map.fitBounds(bounds, {});
        }
    };
    MapService.prototype.zoomToPoint = function (point, zoom) {
        var reprojected = this.map.options.crs.projection.unproject(L.point(point[0], point[1]));
        // this.pointer.setLatLng(reprojected);
        // this.map.setView(reprojected, zoom);
        this.zoomToWgsPoint(reprojected, zoom);
    };
    ;
    MapService.prototype.zoomToWgsPoint = function (point, zoom) {
        this.pointer.setLatLng(point);
        this.map.setView(point, zoom);
    };
    return MapService;
}());
exports.MapService = MapService;
;
