"use strict";
// import * as $ from 'jquery';
var L = require('leaflet');
var servicePool_1 = require('../../servicePool');
var BuienradarLayer = (function () {
    function BuienradarLayer(capabilities) {
        var _this = this;
        this.capabilities = capabilities;
        this.onClickCallbacks = [];
        this.numeral = servicePool_1.default.getService('NumeralService');
        this.floatAttr = [
            'windsnelheidMS',
            'luchtdruk',
            'windrichtingGR',
        ];
        this.ignoreAttr = [
            '$',
            'lat',
            'lon',
            'latGraden',
            'lonGraden',
        ];
        this.celciusAttr = [
            'temperatuurGC',
            'temperatuur10cm',
        ];
        this.percentAttr = [
            'luchtvochtigheid',
        ];
        this.celciusType = function (getal) {
            return _this.numeral.float(getal) + " &deg;C";
        };
        this.msType = function (getal) {
            return _this.numeral.float(getal) + " m/s";
        };
    }
    Object.defineProperty(BuienradarLayer.prototype, "canGetInfoAtPoint", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BuienradarLayer.prototype, "hasOnClick", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BuienradarLayer.prototype, "name", {
        get: function () {
            return 'Actueel weer';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BuienradarLayer.prototype, "title", {
        get: function () {
            return 'Actueel weer';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BuienradarLayer.prototype, "abstract", {
        get: function () {
            return '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BuienradarLayer.prototype, "bounds", {
        get: function () {
            return this.group.getBounds();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BuienradarLayer.prototype, "preview", {
        get: function () {
            return '<img src="http://www.buienradar.nl/resources/images/logor.svg" class="img-responsive">\
        <p>Actuele weersinformatie Buienradar</p>\
        <p>&copy;opyright 2005 - 2016 RTL. Alle rechten voorbehouden</p>\
        <p><a href="http://www.buienradar.nl" target="_blank">http://www.buienradar.nl</a></p>';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BuienradarLayer.prototype, "leaflet", {
        get: function () {
            if (!(this.group)) {
                this.group = this.makeLayer();
            }
            return this.group;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BuienradarLayer.prototype, "legend", {
        get: function () {
            return '<p><img src="http://xml.buienradar.nl/icons/pp.gif">&nbsp;Weerbeeld</p>';
        },
        enumerable: true,
        configurable: true
    });
    BuienradarLayer.prototype.onClick = function (fun) {
        this.onClickCallbacks.push(fun);
    };
    BuienradarLayer.prototype.stationType = function (naam) {
        return naam._;
    };
    BuienradarLayer.prototype.icoonType = function (icoon) {
        return "<img src=\"" + icoon._ + "\">";
    };
    BuienradarLayer.prototype.getType = function (attr) {
        // @todo: kan dit niet beter??
        if (attr === 'url') {
            return 'href';
        }
        else if (this.floatAttr.indexOf(attr) >= 0) {
            return 'float';
        }
        else if (this.ignoreAttr.indexOf(attr) >= 0) {
            return 'skip';
        }
        else if (this.celciusAttr.indexOf(attr) >= 0) {
            return this.celciusType;
        }
        else if (this.percentAttr.indexOf(attr) >= 0) {
            return 'percentage';
        }
        else if (attr === 'stationnaam') {
            return this.stationType;
        }
        else if (attr === 'icoonactueel') {
            return this.icoonType;
        }
        else {
            return 'string';
        }
    };
    BuienradarLayer.prototype.makeLayer = function () {
        var _this = this;
        // this.group = L.layerGroup([]);
        var layers = [];
        var _loop_1 = function(weerstation) {
            var layer = L.marker([parseFloat(weerstation.latGraden), parseFloat(weerstation.lonGraden)], {
                icon: L.icon({
                    iconUrl: weerstation.icoonactueel._,
                    iconSize: [37, 37],
                }),
            });
            layer.on('click', function (e) {
                _this.clickHandler(weerstation);
            });
            layers.push(layer);
        };
        for (var _i = 0, _a = this.capabilities.buienradarnl.weergegevens.actueel_weer.weerstations.weerstation; _i < _a.length; _i++) {
            var weerstation = _a[_i];
            _loop_1(weerstation);
        }
        this.group = L.featureGroup(layers, {
            attribution: 'Buienradar',
        });
        return this.group;
    };
    BuienradarLayer.prototype.clickHandler = function (weerstation) {
        for (var _i = 0, _a = this.onClickCallbacks; _i < _a.length; _i++) {
            var callback = _a[_i];
            callback(this, weerstation);
        }
    };
    ;
    return BuienradarLayer;
}());
exports.BuienradarLayer = BuienradarLayer;
