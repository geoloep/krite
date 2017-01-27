"use strict";
var url = require("url");
var layer_1 = require("./layer");
var xml2js_1 = require("xml2js");
var processors = require('xml2js/lib/processors');
// export interface IGeoServerSourceOptions {
//     wfs?: boolean;
//     wfsNamespace?: string;
//     field?: string;
// }
var WMTSSource = (function () {
    function WMTSSource(url, options) {
        if (options === void 0) { options = {}; }
        this.url = url;
        this.options = options;
        this.capabilities = undefined;
        this.layersLoaded = false;
        this.layerNames = [];
        this.layers = {};
    }
    WMTSSource.prototype.getLayers = function () {
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
    WMTSSource.prototype.getLayerNames = function () {
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
    WMTSSource.prototype.getLayer = function (name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getLayers().then(function (layers) {
                if (name in layers) {
                    resolve(layers[name]);
                }
            });
        });
    };
    WMTSSource.prototype.getCapabilities = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(_this.url +
                url.format({
                    query: {
                        request: 'GetCapabilities',
                    },
                })).then(function (response) {
                if (response.ok) {
                    response.text().then(function (data) {
                        xml2js_1.parseString(data, {
                            async: true,
                            explicitArray: false,
                            tagNameProcessors: [processors.stripPrefix],
                        }, function (err, result) {
                            _this.capabilities = result;
                            for (var _i = 0, _a = _this.capabilities.Capabilities.Contents.Layer; _i < _a.length; _i++) {
                                var layer = _a[_i];
                                _this.layerNames.push(layer.Title);
                                _this.layers[layer.Title] = new layer_1.WMTSLayer(layer, _this);
                            }
                            _this.layersLoaded = true;
                            resolve();
                        });
                    }).catch(reject);
                }
                else {
                    reject();
                }
            }).catch(reject);
        });
    };
    return WMTSSource;
}());
exports.WMTSSource = WMTSSource;
