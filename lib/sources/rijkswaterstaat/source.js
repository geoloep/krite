"use strict";
var $ = require('jquery');
var windsnelheid_1 = require('./windsnelheid');
var windrichting_1 = require('./windrichting');
var RijkswaterstaatSource = (function () {
    function RijkswaterstaatSource() {
        this.layers = {};
        this.layerNames = [
            'Actuele Windsnelheid',
            'Actuele Windrichting',
        ];
        this.nameToType = {
            'Actuele Windsnelheid': windsnelheid_1.WindsnelheidLayer,
            'Actuele Windrichting': windrichting_1.WindrichtingLayer,
        };
    }
    RijkswaterstaatSource.prototype.getLayers = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.capabilities) {
                return _this.layers;
            }
            else {
                _this.makeLayers()
                    .then(function (layers) {
                    return layers;
                })
                    .catch(function () {
                    reject();
                });
            }
        });
    };
    RijkswaterstaatSource.prototype.getLayerNames = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            resolve(_this.layerNames);
        });
    };
    RijkswaterstaatSource.prototype.getLayer = function (name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.layers[name]) {
                resolve(_this.layers[name]);
            }
            else {
                _this.makeLayers()
                    .then(function (layers) {
                    resolve(layers[name]);
                })
                    .catch(function () {
                    reject();
                });
            }
        });
    };
    RijkswaterstaatSource.prototype.makeLayers = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: 'http://service.geoloep.nl/proxy/rijkswaterstaat/rwsnl/?mode=features&projecttype=windsnelheden_en_windstoten',
                dataType: 'json',
            }).done(function (data) {
                _this.capabilities = data;
                for (var _i = 0, _a = _this.layerNames; _i < _a.length; _i++) {
                    var layerName = _a[_i];
                    _this.layers[layerName] = new _this.nameToType[layerName](_this.capabilities);
                }
                resolve(_this.layers);
            }).fail(function (err) {
                console.error(err);
            });
        });
    };
    return RijkswaterstaatSource;
}());
exports.RijkswaterstaatSource = RijkswaterstaatSource;
