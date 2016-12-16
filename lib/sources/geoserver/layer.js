"use strict";
var $ = require('jquery');
var L = require('leaflet');
var wellknown = require('wellknown');
var GeoserverLayer = (function () {
    function GeoserverLayer(capabilities, source) {
        this.capabilities = capabilities;
        this.source = source;
        this.ZIndex = 100;
    }
    ;
    Object.defineProperty(GeoserverLayer.prototype, "canGetInfoAtPoint", {
        get: function () {
            return Boolean(this.source.options.wfs);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GeoserverLayer.prototype, "hasOperations", {
        get: function () {
            return Boolean(this.source.options.wfs);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GeoserverLayer.prototype, "hasOnClick", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GeoserverLayer.prototype, "title", {
        get: function () {
            return this.capabilities.Title;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(GeoserverLayer.prototype, "name", {
        get: function () {
            return this.capabilities.Name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GeoserverLayer.prototype, "abstract", {
        get: function () {
            return this.capabilities.Abstract;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(GeoserverLayer.prototype, "bounds", {
        get: function () {
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GeoserverLayer.prototype, "boundingBox", {
        get: function () {
            var crs = 'EPSG:28992'; // @todo: selecteerbaar maken?
            var bbox = [];
            for (var _i = 0, _a = this.capabilities.BoundingBox; _i < _a.length; _i++) {
                var boundingBox = _a[_i];
                if (boundingBox.crs === 'EPSG:28992') {
                    for (var _b = 0, _c = boundingBox.extent; _b < _c.length; _b++) {
                        var point = _c[_b];
                        bbox.push(point);
                    }
                }
            }
            return bbox;
        },
        enumerable: true,
        configurable: true
    });
    ;
    GeoserverLayer.prototype.intersects = function (feature) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var wkt;
            if (typeof feature === 'object') {
                if (feature.toWKT) {
                    wkt = feature.toWKT();
                }
                else {
                    wkt = wellknown.stringify(feature);
                }
            }
            else {
                wkt = feature;
            }
            $.getJSON(_this.source.url, {
                cql_filter: "INTERSECTS(" + _this.geomField + ", " + wkt + ")",
                outputformat: 'application/json',
                request: 'GetFeature',
                service: 'WFS',
                typenames: _this.typename,
                version: '2.0.0',
            }).done(function (data) {
                resolve(data);
            }).fail(function (data) {
                console.error('Fout in verzoek!');
                reject('AJAX error');
            });
        });
    };
    GeoserverLayer.prototype.getInfoAtPoint = function (point) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var typename = _this.name;
            var field = 'geom';
            if (_this.source.options.wfsNamespace) {
                typename = _this.source.options.wfsNamespace + ':' + typename;
            }
            if (_this.source.options.field) {
                field = _this.source.options.field;
            }
            $.getJSON(_this.source.url, {
                cql_filter: "INTERSECTS(" + field + ", POINT(" + point.x + " " + point.y + "))",
                outputformat: 'application/json',
                request: 'GetFeature',
                service: 'WFS',
                typenames: typename,
                version: '2.0.0',
            }).done(function (data) {
                resolve(data);
            }).fail(function (data) {
                console.error('Fout in verzoek!');
                reject('AJAX error');
            });
        });
    };
    ;
    GeoserverLayer.prototype.getPreviewSize = function (bbox, width) {
        var dx = bbox[2] - bbox[0];
        var dy = bbox[3] - bbox[1];
        return {
            height: Math.round(width * (dy / dx)),
            width: width,
        };
    };
    ;
    Object.defineProperty(GeoserverLayer.prototype, "preview", {
        get: function () {
            var extent = '';
            var bbox = this.boundingBox;
            var widthHeigth = this.getPreviewSize(bbox, 339);
            for (var i = 0; i < 3; i++) {
                extent += bbox[i] + ',';
            }
            extent += bbox.pop();
            return "<img style=\"max-width: 100%; max-height: 400px; display: block; margin: 0 auto\" src=\"" + this.source.url + "?service=WMS&request=GetMap&layers=" + this.name + "&srs=EPSG:28992&bbox=" + extent + "&width=" + widthHeigth.width + "&height=" + widthHeigth.height + "&format=image%2Fpng\">";
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(GeoserverLayer.prototype, "leaflet", {
        get: function () {
            if (this._leaflet) {
                return this._leaflet;
            }
            else {
                this._leaflet = L.tileLayer.wms(this.source.url, {
                    format: 'image/png',
                    layers: this.name,
                    transparent: true,
                });
                return this._leaflet;
            }
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(GeoserverLayer.prototype, "legend", {
        get: function () {
            try {
                return "<img class=\"img-responsive\" src=\"" + this.capabilities.Style[0].LegendURL[0].OnlineResource + "\">";
            }
            catch (e) {
                return '<p>-</p>';
            }
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(GeoserverLayer.prototype, "typename", {
        get: function () {
            if (this.source.options.wfsNamespace) {
                return this.source.options.wfsNamespace + ':' + this.name;
            }
            else {
                return this.name;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GeoserverLayer.prototype, "geomField", {
        get: function () {
            if (this.source.options.field) {
                return this.source.options.field;
            }
            else {
                return 'geom';
            }
        },
        enumerable: true,
        configurable: true
    });
    return GeoserverLayer;
}());
exports.GeoserverLayer = GeoserverLayer;
