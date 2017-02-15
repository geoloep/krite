"use strict";
var L = require("leaflet");
// import * as reproject from 'reproject';
var servicePool_1 = require("../servicePool");
/**
 * This service controls the leaflet map.
 */
var MapService = (function () {
    function MapService(element, customOptions) {
        var _this = this;
        this.element = element;
        this.customOptions = customOptions;
        this.layers = [];
        this.layerByName = {};
        this.defaultOptions = {};
        this.project = servicePool_1.default.getService('ProjectService');
        this.clickHandlers = [];
        this.layerClickCallbacks = [];
        /**
         * Layers can report click events here
         */
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
    /**
     * Add a new layer to the map
     */
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
    /**
     * Show previously hidden layers again
     */
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
    /**
     * Hide a layer from the map only
     */
    MapService.prototype.hideLayer = function (layer) {
        layer.leaflet.remove();
    };
    ;
    /**
     * Register onclick callbacks here
     */
    MapService.prototype.onClick = function (fun) {
        this.clickHandlers.push(fun);
    };
    ;
    /**
     * Register onLayerClick callbacks here
     */
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
    /**
     * Render a geojson source on the map.
     * @param geojson   Expected to be in the map crs
     */
    MapService.prototype.addHighlight = function (geojson, zoomTo) {
        if (zoomTo === void 0) { zoomTo = false; }
        if (this.highlight) {
            this.highlight.remove();
        }
        if (this.focus) {
            this.focus.remove();
        }
        var reprojected = this.project.to(geojson);
        this.highlight = L.geoJSON(reprojected, {
            pointToLayer: function (geojsonPoint, latlng) {
                return L.circleMarker(latlng);
            },
        });
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
        if (this.focus) {
            this.focus.remove();
        }
    };
    /**
     * Show previously hidden highlight again
     */
    MapService.prototype.showHighlight = function () {
        if (this.highlight) {
            this.highlight.addTo(this.map);
        }
    };
    /**
     * Temporary solution
     */
    MapService.prototype.addFocus = function (geojson, zoomTo) {
        if (zoomTo === void 0) { zoomTo = false; }
        if (this.focus) {
            this.focus.remove();
        }
        var reprojected = this.project.to(geojson);
        this.focus = L.geoJSON(reprojected, {
            style: function () {
                return {
                    color: '#FF33EE',
                    weight: 5,
                    opacity: 1,
                    fill: false,
                };
            },
            pointToLayer: function (geojsonPoint, latlng) {
                return L.circleMarker(latlng);
            },
        });
        this.focus.addTo(this.map);
        if (zoomTo) {
            this.map.fitBounds(this.focus.getBounds());
        }
    };
    ;
    /**
     * Permanently remove a layer from the map
     */
    MapService.prototype.removeLayer = function (layer) {
        layer.leaflet.remove();
        this.layers.splice(this.layers.indexOf(layer), 1);
        delete this.layerByName[layer.name];
    };
    ;
    /**
     * Set the basemap. Only L.TileLayers are supported at the moment
     */
    MapService.prototype.setBaseMap = function (url, options) {
        if (this.basemap) {
            this.basemap.remove();
        }
        this.basemap = L.tileLayer(url, options);
        this.basemap.setZIndex(-1);
        this.basemap.addTo(this.map);
    };
    ;
    /**
     * Inform the map that the user is in inspect mode
     */
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
    /**
     * Zoom to a point
     * @param point In the CRS of the map
     */
    MapService.prototype.zoomToPoint = function (point, zoom) {
        var reprojected = this.map.options.crs.projection.unproject(L.point(point[0], point[1]));
        this.zoomToWgsPoint(reprojected, zoom);
    };
    ;
    /**
     * Zoom to a point
     * @param point In LatLng (WGS84)
     */
    MapService.prototype.zoomToWgsPoint = function (point, zoom) {
        this.pointer.setLatLng(point);
        this.map.setView(point, zoom);
    };
    return MapService;
}());
exports.MapService = MapService;
;
