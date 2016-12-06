"use strict";
var $ = require('jquery');
var xml2js_1 = require('xml2js');
var layer_1 = require('./layer');
var AardbevingenSource = (function () {
    function AardbevingenSource() {
    }
    AardbevingenSource.prototype.getLayers = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.layer) {
                return {
                    'Actueel Weer': _this.layer,
                };
            }
            else {
                _this.getLayer('Recente aardbevingen')
                    .then(function (layer) {
                    return {
                        'Recente aardbevingen': _this.layer,
                    };
                })
                    .catch(function () {
                    reject();
                });
            }
        });
    };
    AardbevingenSource.prototype.getLayerNames = function () {
        return new Promise(function (resolve, reject) {
            resolve(['Recente aardbevingen']);
        });
    };
    AardbevingenSource.prototype.getLayer = function (name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.layer) {
                resolve(_this.layer);
            }
            else {
                _this.makeLayer()
                    .then(function (layer) {
                    resolve(layer);
                })
                    .catch(function () {
                    reject();
                });
            }
        });
    };
    AardbevingenSource.prototype.makeLayer = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: 'http://service.geoloep.nl/proxy/aardbevingen/GQuake_KNMI_RSS.xml',
                dataType: 'text',
            }).done(function (data) {
                xml2js_1.parseString(data, {
                    async: true,
                    explicitArray: false,
                }, function (err, result) {
                    _this.capabilities = result;
                    _this.layer = new layer_1.AardbevingLayer(result);
                    resolve(_this.layer);
                });
            }).fail(function (err) {
                reject();
            });
        });
    };
    return AardbevingenSource;
}());
exports.AardbevingenSource = AardbevingenSource;
