"use strict";
var url = require('url');
var xml2js_1 = require('xml2js');
var layer_1 = require('./layer');
var WFSSource = (function () {
    function WFSSource(url) {
        this.url = url;
        this.layersLoaded = false;
        this.layerNames = [];
        this.layers = {};
    }
    WFSSource.prototype.getLayers = function () {
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
    WFSSource.prototype.getLayerNames = function () {
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
    WFSSource.prototype.getLayer = function (name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getLayers().then(function (layers) {
                if (name in layers) {
                    resolve(layers[name]);
                }
            });
        });
    };
    WFSSource.prototype.getCapabilities = function () {
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
                            explicitArray: true,
                        }, function (err, result) {
                            console.log(result);
                            for (var _i = 0, _a = result['wfs:WFS_Capabilities'].FeatureTypeList[0].FeatureType; _i < _a.length; _i++) {
                                var featureType = _a[_i];
                                _this.layerNames.push(featureType.Title[0]);
                                _this.layers[featureType.Title[0]] = new layer_1.WFSLayer(featureType, _this);
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
    return WFSSource;
}());
exports.WFSSource = WFSSource;
