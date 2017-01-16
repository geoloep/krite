"use strict";
var url = require('url');
var tiledMapLayer_1 = require('./tiledMapLayer');
var ESRISource = (function () {
    function ESRISource(url) {
        this.url = url;
        this.typeToLayer = {
            MapServer: tiledMapLayer_1.ESRITiledMapLayer,
        };
        this.layers = {};
    }
    ESRISource.prototype.getLayers = function () {
        return new Promise(function (resolve, reject) {
            reject('Not implemented');
        });
    };
    ESRISource.prototype.getLayerNames = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.services) {
                resolve(_this._getLayerNames());
            }
            else {
                _this.getServices().then(function () {
                    resolve(_this._getLayerNames());
                });
            }
        });
    };
    ESRISource.prototype._getLayerNames = function () {
        var layerNames = [];
        for (var _i = 0, _a = this.services.services; _i < _a.length; _i++) {
            var service = _a[_i];
            layerNames.push(service.name);
        }
        return (layerNames);
    };
    ESRISource.prototype.getLayer = function (name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var _loop_1 = function(service) {
                if (service.name === name) {
                    if (service.type in _this.typeToLayer) {
                        // Soms is de naam service/laag, we moeten alleen 'laag' toevoegen aan de url
                        var urlName = name.split('/').pop();
                        var fullUrl_1 = "" + _this.url + urlName + "/" + service.type + "/"; //this.url + urlName + '/';
                        fetch(fullUrl_1 +
                            url.format({
                                query: {
                                    f: 'pjson',
                                },
                            })).then(function (response) {
                            if (response.ok) {
                                response.json().then(function (json) {
                                    _this.layers[name] = new _this.typeToLayer[service.type](fullUrl_1, json, _this);
                                    resolve(_this.layers[name]);
                                }).catch(reject);
                            }
                            else {
                                reject();
                            }
                        }).catch(reject);
                    }
                    else {
                        reject("No implementation for " + service.type);
                    }
                }
            };
            for (var _i = 0, _a = _this.services.services; _i < _a.length; _i++) {
                var service = _a[_i];
                _loop_1(service);
            }
        });
    };
    ESRISource.prototype.getServices = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(_this.url +
                url.format({
                    query: {
                        f: 'pjson',
                    },
                })).then(function (response) {
                if (response.ok) {
                    response.json().then(function (json) {
                        _this.services = json;
                        resolve();
                    }).catch(reject);
                }
                else {
                    reject('Fout bij inlezen antwoord server');
                }
            }).catch(reject);
        });
    };
    return ESRISource;
}());
exports.ESRISource = ESRISource;
