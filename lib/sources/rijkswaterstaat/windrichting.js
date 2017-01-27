"use strict";
var L = require("leaflet");
var rd = require("leaflet-rd");
var WindrichtingLayer = (function () {
    function WindrichtingLayer(capabilities) {
        this.capabilities = capabilities;
        this.onClickCallbacks = [];
        this.attrTypes = {
            locatienaam: 'string',
            loc: 'string',
            net: 'string',
            waarde: 'int',
            eenheid: 'string',
            iconsubscript: 'string',
            ids: 'string',
        };
    }
    Object.defineProperty(WindrichtingLayer.prototype, "hasOnClick", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindrichtingLayer.prototype, "name", {
        get: function () {
            return 'Actuele Windrichting';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindrichtingLayer.prototype, "title", {
        get: function () {
            return 'Actuele Windrichting';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindrichtingLayer.prototype, "abstract", {
        get: function () {
            return '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindrichtingLayer.prototype, "bounds", {
        get: function () {
            return this.group.getBounds();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindrichtingLayer.prototype, "preview", {
        get: function () {
            return '<p>Actuele Windrichting Rijkswaterstaat</p>';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindrichtingLayer.prototype, "leaflet", {
        get: function () {
            if (!(this.group)) {
                this.group = this.makeLayer();
            }
            return this.group;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindrichtingLayer.prototype, "legend", {
        get: function () {
            return '<p><span class="fa fa-long-arrow-up" style="transform: rotate(90deg)"></span></p>';
        },
        enumerable: true,
        configurable: true
    });
    WindrichtingLayer.prototype.onClick = function (fun) {
        this.onClickCallbacks.push(fun);
    };
    WindrichtingLayer.prototype.getType = function (attr) {
        if (attr in this.attrTypes) {
            return this.attrTypes[attr];
        }
        else {
            return 'skip';
        }
    };
    WindrichtingLayer.prototype.makeLayer = function () {
        var _this = this;
        var layers = [];
        var _loop_1 = function (feature) {
            if (feature.parameternaam === 'Windrichting' && feature.location) {
                var layer = L.marker(rd.projection.unproject(L.point([feature.location.lon, feature.location.lat])), {
                    icon: L.divIcon({
                        className: '',
                        html: "<span class=\"fa fa-long-arrow-down\" style=\"transform: rotate(" + feature.waarde + "deg)\"></span>",
                        iconAnchor: [2.9, 8.5],
                    }),
                });
                layer.on('click', function (e) {
                    _this.clickHandler(feature);
                });
                layers.push(layer);
            }
        };
        for (var _i = 0, _a = this.capabilities.features; _i < _a.length; _i++) {
            var feature = _a[_i];
            _loop_1(feature);
        }
        this.group = L.featureGroup(layers);
        return this.group;
    };
    WindrichtingLayer.prototype.clickHandler = function (feature) {
        for (var _i = 0, _a = this.onClickCallbacks; _i < _a.length; _i++) {
            var callback = _a[_i];
            callback(this, feature);
        }
    };
    ;
    return WindrichtingLayer;
}());
exports.WindrichtingLayer = WindrichtingLayer;
