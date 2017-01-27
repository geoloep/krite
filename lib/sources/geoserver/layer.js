"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var L = require("leaflet");
var wellknown = require("wellknown");
var url = require("url");
var GeoserverLayer = (function () {
    function GeoserverLayer(capabilities, wfscapabilities, type, source) {
        this.capabilities = capabilities;
        this.wfscapabilities = wfscapabilities;
        this.type = type;
        this.source = source;
        this._withinDistance = 5;
        this.ZIndex = 100;
    }
    ;
    Object.defineProperty(GeoserverLayer.prototype, "canGetInfoAtPoint", {
        get: function () {
            return Boolean(this.wfscapabilities);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GeoserverLayer.prototype, "hasOperations", {
        get: function () {
            return Boolean(this.wfscapabilities);
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
            fetch(_this.source.url + url.format({
                query: {
                    cql_filter: "INTERSECTS(" + _this.geomField + ", " + wkt + ")",
                    outputformat: 'application/json',
                    request: 'GetFeature',
                    service: 'WFS',
                    typenames: _this.typename,
                    version: '2.0.0',
                },
            })).then(function (response) {
                if (response.ok) {
                    response.json().then(resolve);
                }
                else {
                    reject();
                }
            }).catch(reject);
        });
    };
    GeoserverLayer.prototype.getInfoAtPoint = function (point) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.isPoint) {
                    return [2 /*return*/, this._getInfoNearPoint(point)];
                }
                else {
                    return [2 /*return*/, this._getInfoAtPoint(point)];
                }
                return [2 /*return*/];
            });
        });
    };
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
    GeoserverLayer.prototype._getInfoAtPoint = function (point) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.wfscapabilities) {
                var typename = _this.wfscapabilities.Name[0];
                var field = _this.geomField;
                fetch(_this.source.url + url.format({
                    query: {
                        cql_filter: "INTERSECTS(" + field + ", POINT(" + point.x + " " + point.y + "))",
                        outputformat: 'application/json',
                        request: 'GetFeature',
                        service: 'WFS',
                        typenames: typename,
                        version: '2.0.0',
                    },
                })).then(function (response) {
                    if (response.ok) {
                        response.json().then(resolve);
                    }
                    else {
                        reject();
                    }
                }).catch(reject);
            }
        });
    };
    ;
    GeoserverLayer.prototype._getInfoNearPoint = function (point) {
        return __awaiter(this, void 0, void 0, function () {
            var typename, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        typename = this.wfscapabilities.Name[0];
                        return [4 /*yield*/, fetch(this.source.url + url.format({
                                query: {
                                    cql_filter: "DWITHIN(" + this.geomField + ", POINT(" + point.x + " " + point.y + "), " + this._withinDistance + ", meters)",
                                    outputformat: 'application/json',
                                    request: 'GetFeature',
                                    service: 'WFS',
                                    typenames: typename,
                                    version: '2.0.0',
                                },
                            }))];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: throw new Error('Fetch failed');
                }
            });
        });
    };
    Object.defineProperty(GeoserverLayer.prototype, "typename", {
        get: function () {
            if (this.wfscapabilities) {
                return this.wfscapabilities.Name[0];
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
            if (this._geomField) {
                return this._geomField;
            }
            else {
                if (this.type) {
                    for (var _i = 0, _a = this.type; _i < _a.length; _i++) {
                        var field = _a[_i];
                        if (field.$.type.split(':')[0] === 'gml') {
                            this._geomField = field.$.name;
                            break;
                        }
                    }
                }
                if (!(this._geomField)) {
                    console.warn("Using default geometry field name for " + this.name);
                    this._geomField = 'geom';
                }
                return this._geomField;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GeoserverLayer.prototype, "isPoint", {
        get: function () {
            if (this._isPoint) {
                return this._isPoint;
            }
            else {
                this._isPoint = false;
                if (this.type) {
                    for (var _i = 0, _a = this.type; _i < _a.length; _i++) {
                        var field = _a[_i];
                        if (field.$.type.split(':')[0] === 'gml' && field.$.type.toLowerCase().includes('point')) {
                            this._isPoint = true;
                            break;
                        }
                    }
                }
                return this._isPoint;
            }
        },
        enumerable: true,
        configurable: true
    });
    return GeoserverLayer;
}());
exports.GeoserverLayer = GeoserverLayer;
