"use strict";
var L = require("leaflet");
var rd = require("leaflet-rd");
var WindsnelheidLayer = (function () {
    function WindsnelheidLayer(capabilities) {
        this.capabilities = capabilities;
        this.onClickCallbacks = [];
        this.attrTypes = {
            locatienaam: 'string',
            loc: 'string',
            net: 'string',
            waarde: 'float',
            eenheid: 'string',
            iconsubscript: 'string',
            ids: 'string',
            windkracht: 'int',
        };
        this.msToBft = [
            0.3,
            1.6,
            3.4,
            5.5,
            8.0,
            10.8,
            13.9,
            17.2,
            20.8,
            24.5,
            28.5,
            32.7,
        ];
    }
    Object.defineProperty(WindsnelheidLayer.prototype, "hasOnClick", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindsnelheidLayer.prototype, "name", {
        get: function () {
            return 'Actuele Windsnelheid';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindsnelheidLayer.prototype, "title", {
        get: function () {
            return 'Actuele Windsnelheid';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindsnelheidLayer.prototype, "abstract", {
        get: function () {
            return '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindsnelheidLayer.prototype, "bounds", {
        get: function () {
            return this.group.getBounds();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindsnelheidLayer.prototype, "preview", {
        get: function () {
            return '<p>Actuele Windsnelheid Rijkswaterstaat</p>';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindsnelheidLayer.prototype, "leaflet", {
        get: function () {
            if (!(this.group)) {
                this.group = this.makeLayer();
            }
            return this.group;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WindsnelheidLayer.prototype, "legend", {
        get: function () {
            if (this._legend) {
                return this._legend;
            }
            else {
                this._legend = '<p>';
                for (var i = 0; i < 12; i += 2) {
                    this._legend += "<span class=\"fa-stack fa-lg\">\n                                    <i class=\"fa fa-circle fa-stack-1x\" style=\"color: #" + this.bftToColour(i) + "\"></i>\n                                    <i class=\"fa fa-circle-thin fa-stack-1x\"></i>\n                                </span>&nbsp;&nbsp;Windkracht " + i + " - " + (i + 1) + "<br>";
                }
                this._legend += "<span class=\"fa-stack fa-lg\">\n                                    <i class=\"fa fa-circle fa-stack-1x\" style=\"color: #" + this.bftToColour(12) + "\"></i>\n                                    <i class=\"fa fa-circle-thin fa-stack-1x\"></i>\n                                </span>&nbsp;&nbsp;Windkracht 12 +</p>";
                return this._legend;
            }
        },
        enumerable: true,
        configurable: true
    });
    WindsnelheidLayer.prototype.onClick = function (fun) {
        this.onClickCallbacks.push(fun);
    };
    WindsnelheidLayer.prototype.getType = function (attr) {
        if (attr in this.attrTypes) {
            return this.attrTypes[attr];
        }
        else {
            return 'skip';
        }
    };
    WindsnelheidLayer.prototype.bftToColour = function (bft) {
        return bft > 11 ? 'd73027' :
            bft > 9 ? 'fc8d59' :
                bft > 7 ? 'fee08b' :
                    bft > 5 ? 'ffffbf' :
                        bft > 3 ? 'd9ef8b' :
                            bft > 1 ? '91cf60' :
                                '1a9850';
    };
    WindsnelheidLayer.prototype.makeLayer = function () {
        var _this = this;
        var layers = [];
        var _loop_1 = function (feature) {
            if (feature.parameternaam === 'Windsnelheid' && feature.location) {
                var bft = 0;
                for (var i = 0; i < this_1.msToBft.length; i++) {
                    if (parseFloat(feature.waarde) < this_1.msToBft[i]) {
                        bft = i;
                        feature.windkracht = i;
                        break;
                    }
                }
                var layer = L.marker(rd.projection.unproject(L.point([feature.location.lon, feature.location.lat])), {
                    icon: L.divIcon({
                        className: '',
                        html: "<span class=\"fa-stack fa-lg\">\n                            <i class=\"fa fa-circle fa-stack-1x\" style=\"color: #" + this_1.bftToColour(bft) + "\"></i>\n                            <i class=\"fa fa-circle-thin fa-stack-1x\"></i>\n                        </span>",
                        iconSize: [32, 32],
                    }),
                });
                layer.on('click', function (e) {
                    _this.clickHandler(feature);
                });
                layers.push(layer);
            }
        };
        var this_1 = this;
        for (var _i = 0, _a = this.capabilities.features; _i < _a.length; _i++) {
            var feature = _a[_i];
            _loop_1(feature);
        }
        this.group = L.featureGroup(layers);
        return this.group;
    };
    WindsnelheidLayer.prototype.clickHandler = function (feature) {
        for (var _i = 0, _a = this.onClickCallbacks; _i < _a.length; _i++) {
            var callback = _a[_i];
            callback(this, feature);
        }
    };
    ;
    return WindsnelheidLayer;
}());
exports.WindsnelheidLayer = WindsnelheidLayer;
