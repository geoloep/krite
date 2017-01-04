"use strict";
var url = require('url');
var layer_1 = require('./layer');
// wms-capabilities heeft geen definitie 
var WMSCapabilities = require('wms-capabilities');
var GeoServerSource = (function () {
    function GeoServerSource(url, options) {
        if (options === void 0) { options = {}; }
        this.url = url;
        this.options = options;
        this.capabilities = undefined;
        this.layersLoaded = false;
        this.layerNames = [];
        this.layers = {};
    }
    GeoServerSource.prototype.getLayers = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.layersLoaded) {
                resolve(_this.layers);
            }
            else {
                _this.getCapabilities().then(function () {
                    resolve(_this.layers);
                });
            }
        });
    };
    GeoServerSource.prototype.getLayerNames = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.layersLoaded) {
                resolve(_this.layerNames);
            }
            else {
                _this.getCapabilities().then(function () {
                    resolve(_this.layerNames);
                });
            }
        });
    };
    GeoServerSource.prototype.getLayer = function (name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getLayers().then(function (layers) {
                if (name in layers) {
                    resolve(layers[name]);
                }
            });
        });
    };
    GeoServerSource.prototype.getCapabilities = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(_this.url +
                url.format({
                    query: {
                        request: 'GetCapabilities',
                        service: 'WMS',
                    },
                })).then(function (response) {
                if (response.ok) {
                    response.text().then(function (data) {
                        _this.capabilities = new WMSCapabilities(data).toJSON();
                        for (var _i = 0, _a = _this.capabilities.Capability.Layer.Layer; _i < _a.length; _i++) {
                            var layer = _a[_i];
                            _this.layerNames.push(layer.Name);
                            _this.layers[layer.Name] = new layer_1.GeoserverLayer(layer, _this);
                        }
                        _this.layersLoaded = true;
                        resolve();
                    }).catch(reject);
                }
                else {
                    reject();
                }
            }).catch(reject);
        });
    };
    return GeoServerSource;
}());
exports.GeoServerSource = GeoServerSource;
