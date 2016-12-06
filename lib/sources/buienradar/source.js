"use strict";
var $ = require('jquery');
var xml2js_1 = require('xml2js');
var layer_1 = require('./layer');
var BuienradarSource = (function () {
    function BuienradarSource() {
    }
    BuienradarSource.prototype.getLayers = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.layer) {
                return {
                    'Actueel Weer': _this.layer,
                };
            }
            else {
                _this.getLayer('Actueel weer')
                    .then(function (layer) {
                    return {
                        'Actueel Weer': _this.layer,
                    };
                })
                    .catch(function () {
                    reject();
                });
            }
        });
    };
    BuienradarSource.prototype.getLayerNames = function () {
        return new Promise(function (resolve, reject) {
            resolve(['Actueel weer']);
        });
    };
    BuienradarSource.prototype.getLayer = function (name) {
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
    BuienradarSource.prototype.makeLayer = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: 'http://xml.buienradar.nl/',
                dataType: 'text',
            }).done(function (data) {
                xml2js_1.parseString(data, {
                    async: true,
                    explicitArray: false,
                }, function (err, result) {
                    _this.capabilities = result;
                    _this.layer = new layer_1.BuienradarLayer(result);
                    resolve(_this.layer);
                });
            }).fail(function (err) {
                reject();
            });
        });
    };
    return BuienradarSource;
}());
exports.BuienradarSource = BuienradarSource;
