"use strict";
var url = require('url');
var layer_1 = require('./layer');
// wms-capabilities heeft geen definitie 
var WMSCapabilities = require('wms-capabilities');
var xml2js_1 = require('xml2js');
var GeoServerSource = (function () {
    function GeoServerSource(url, options) {
        if (options === void 0) { options = {}; }
        this.url = url;
        this.options = options;
        this.wfsFeature = {};
        this.wfsFeatureTypes = {};
        this.wfsFeatureToType = {};
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
            var getWMSCapabilities = fetch(_this.url +
                url.format({
                    query: {
                        request: 'GetCapabilities',
                        service: 'WMS',
                    },
                }));
            var getWFSCapabilities = fetch(_this.url +
                url.format({
                    query: {
                        request: 'GetCapabilities',
                        service: 'WFS',
                    },
                }));
            // Wacht op inladen van capabilities
            Promise.all([getWMSCapabilities, getWFSCapabilities]).then(function (response) {
                for (var _i = 0, response_1 = response; _i < response_1.length; _i++) {
                    var r = response_1[_i];
                    if (!(r.ok)) {
                        reject();
                    }
                }
                // Wacht op uitlezen antwoorden getCapabilities
                Promise.all([response[0].text(), response[1].text()]).then(function (data) {
                    _this.capabilities = new WMSCapabilities(data[0]).toJSON(); // @todo: eigen implementatie maken
                    // WFS uitlezen en status bepalen
                    var readWFS = new Promise(function (res, rej) {
                        xml2js_1.parseString(data[1], {
                            async: true,
                            explicitArray: true,
                        }, function (err, result) {
                            console.log(result);
                            if ('wfs:WFS_Capabilities' in result) {
                                // WFS is geactiveerd
                                for (var _i = 0, _a = result['wfs:WFS_Capabilities'].FeatureTypeList[0].FeatureType; _i < _a.length; _i++) {
                                    var featureType = _a[_i];
                                    _this.wfsFeature[featureType.Title[0]] = featureType;
                                }
                                // Featuretypen beschrijven
                                fetch(_this.url +
                                    url.format({
                                        query: {
                                            request: 'DescribeFeatureType',
                                            service: 'WFS',
                                        },
                                    })).then(function (desResponse) {
                                    if (desResponse.ok) {
                                        desResponse.text().then(function (desData) {
                                            xml2js_1.parseString(desData, {
                                                async: true,
                                                explicitArray: true,
                                            }, function (desErr, desResult) {
                                                for (var _i = 0, _a = desResult['xsd:schema']['xsd:element']; _i < _a.length; _i++) {
                                                    var element = _a[_i];
                                                    // Een lijst aanmaken van welke FeatureType bij welke laag hoort
                                                    _this.wfsFeatureToType[element.$.name] = element.$.type.split(':').pop();
                                                }
                                                for (var _b = 0, _c = desResult['xsd:schema']['xsd:complexType']; _b < _c.length; _b++) {
                                                    var complexType = _c[_b];
                                                    var name_1 = complexType.$.name;
                                                    // Een lijst aanmaken van de velden die bij een FeatureType horen
                                                    _this.wfsFeatureTypes[name_1] = complexType['xsd:complexContent'][0]['xsd:extension'][0]['xsd:sequence'][0]['xsd:element'];
                                                    console.log(_this.wfsFeatureTypes);
                                                }
                                                res();
                                            });
                                        }).catch(reject);
                                    }
                                    else {
                                        reject();
                                    }
                                }).catch(reject);
                            }
                            else {
                                res();
                            }
                        });
                    }).then(function () {
                        for (var _i = 0, _a = _this.capabilities.Capability.Layer.Layer; _i < _a.length; _i++) {
                            var layer = _a[_i];
                            _this.layerNames.push(layer.Name);
                            _this.layers[layer.Name] = new layer_1.GeoserverLayer(layer, _this.wfsFeature[layer.Title], _this.wfsFeatureTypes[_this.wfsFeatureToType[layer.Name]], _this);
                        }
                        _this.layersLoaded = true;
                        resolve();
                    });
                });
            }).catch(reject);
        });
    };
    return GeoServerSource;
}());
exports.GeoServerSource = GeoServerSource;
