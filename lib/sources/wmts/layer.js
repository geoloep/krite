"use strict";
var L = require('leaflet');
var WMTSLayer = (function () {
    function WMTSLayer(capabilities, source) {
        this.capabilities = capabilities;
        this.source = source;
    }
    Object.defineProperty(WMTSLayer.prototype, "title", {
        get: function () {
            return this.capabilities.Title;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WMTSLayer.prototype, "name", {
        get: function () {
            return this.capabilities.Identifier;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WMTSLayer.prototype, "abstract", {
        get: function () {
            return this.capabilities.Title;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WMTSLayer.prototype, "bounds", {
        get: function () {
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WMTSLayer.prototype, "preview", {
        get: function () {
            return "<p>" + this.capabilities.Title + "</p>";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WMTSLayer.prototype, "leaflet", {
        get: function () {
            if (this._leaflet) {
                return this._leaflet;
            }
            else {
                this._leaflet = L.tileLayer(this.source.url + ("?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=" + this.capabilities.Title + "&TILEMATRIXSET=EPSG:28992&TILEMATRIX=EPSG:28992:{z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png"), {
                    maxZoom: 16,
                    minZoom: 3,
                    maxNativeZoom: 14,
                });
                return this._leaflet;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WMTSLayer.prototype, "legend", {
        get: function () {
            return '<p>-</p>';
        },
        enumerable: true,
        configurable: true
    });
    return WMTSLayer;
}());
exports.WMTSLayer = WMTSLayer;
