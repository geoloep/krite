"use strict";
var esri = require('esri-leaflet');
var ESRITiledMapLayer = (function () {
    function ESRITiledMapLayer(url, capabilities, source) {
        this.url = url;
        this.capabilities = capabilities;
        this.source = source;
    }
    ;
    Object.defineProperty(ESRITiledMapLayer.prototype, "title", {
        get: function () {
            return this.capabilities.mapName;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ESRITiledMapLayer.prototype, "name", {
        get: function () {
            return this.capabilities.mapName;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ESRITiledMapLayer.prototype, "abstract", {
        get: function () {
            return this.capabilities.abstract;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ESRITiledMapLayer.prototype, "bounds", {
        get: function () {
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ESRITiledMapLayer.prototype, "preview", {
        get: function () {
            return '';
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ESRITiledMapLayer.prototype, "leaflet", {
        get: function () {
            if (this._leaflet) {
                return this._leaflet;
            }
            else {
                this._leaflet = esri.tiledMapLayer({
                    url: this.url,
                });
                return this._leaflet;
            }
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ESRITiledMapLayer.prototype, "legend", {
        get: function () {
            return "<p>" + this.capabilities.mapName + "</p>";
        },
        enumerable: true,
        configurable: true
    });
    ;
    return ESRITiledMapLayer;
}());
exports.ESRITiledMapLayer = ESRITiledMapLayer;
