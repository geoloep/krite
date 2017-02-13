"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var Ractive = require("ractive");
var ractiveApp_1 = require("../ractiveApp");
var servicePool_1 = require("../../servicePool");
var InspectorApp = (function (_super) {
    __extends(InspectorApp, _super);
    function InspectorApp(element) {
        var _this = _super.call(this) || this;
        _this.element = element;
        _this.visible = false;
        _this.map = servicePool_1.default.getService('MapService');
        _this.service = servicePool_1.default.getService('InspectorService');
        _this.numeral = servicePool_1.default.getService('NumeralService');
        _this.sidebar = servicePool_1.default.tryService('SidebarService');
        _this.active = false;
        _this.features = [];
        _this.index = 0;
        _this.onClick = function (point) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, e_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(this.active && this.visible && this.service.layer.hasOperations && this.service.layer.intersectsPoint)) return [3 /*break*/, 4];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        _a = this.loadFeatureCollection;
                        return [4 /*yield*/, this.service.layer.intersectsPoint(point)];
                    case 2:
                        _a.apply(this, [_c.sent()]);
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _c.sent();
                        console.error(e_1);
                        this.ractive.set('error', true);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        _this.onLayerClick = function (layer, attr) {
            if (_this.visible && _this.service.layer && layer.name === _this.service.layer.name) {
                _this.showTable(attr);
            }
            else if (!(_this.visible) && _this.sidebar) {
                // Klikken op vectorlagen altijd mogelijk maken
                _this.service.layer = layer;
                _this.sidebar.setApp('InspectorApp');
                _this.showTable(attr);
            }
        };
        _this.loadFeature = function (feature) {
            _this.showTable(feature.properties);
            _this.map.addHighlight(feature);
        };
        _this.loadFeatureCollection = function (collection) {
            // Reset inspector state
            _this.index = 0;
            _this.features.splice(0);
            for (var _i = 0, _a = collection.features; _i < _a.length; _i++) {
                var feature = _a[_i];
                _this.features.push(feature);
            }
            if (_this.features.length > 0) {
                // Load first feature
                // this.loadFeature(this.features[0]);
                _this.ractive.set('feature', _this.features[0]);
                // Set the field to name features with
                // @todo: allow layers to provide
                _this.ractive.set('namefield', Object.keys(_this.features[0].properties)[0]);
            }
            else {
            }
        };
        _super.prototype.init.call(_this, element);
        _this.map.onClick(_this.onClick);
        _this.map.onLayerClick(_this.onLayerClick);
        return _this;
    }
    ;
    InspectorApp.prototype.insert = function (element) {
        _super.prototype.insert.call(this, element);
        if (this.ractive) {
            this.ractive.set({ layer: this.service.name });
            this.visible = true;
        }
        if (this.active) {
            this.map.startInspect();
            this.map.showHighlight();
        }
    };
    InspectorApp.prototype.detatch = function () {
        _super.prototype.detatch.call(this);
        this.visible = false;
        this.map.endInspect();
        this.map.hideHighlight();
    };
    InspectorApp.prototype.createRactive = function (element) {
        var _this = this;
        this.ractive = new Ractive({
            append: true,
            modifyArrays: true,
            el: element,
            template: require('./template.html'),
            data: {
                layers: this.map.layers,
                layer: this.service.name,
                features: this.features,
                feature: '',
                namefield: '',
                allowed: false,
                properties: {},
                error: false,
            },
        });
        this.ractive.observe('layer', function (n) {
            _this.service.layer = _this.map.layerByName[n];
            _this.clear();
            if (_this.service.layer && ((_this.service.layer.hasOperations && _this.service.layer.intersectsPoint) || _this.service.layer.hasOnClick)) {
                _this.ractive.set('allowed', true);
                _this.ractive.set('error', false);
                _this.active = true;
                _this.map.startInspect();
            }
            else {
                _this.ractive.set('allowed', false);
                _this.active = false;
                _this.map.endInspect();
            }
        });
        this.ractive.observe('feature', function (n) {
            if (typeof (n) === 'object' && n.properties) {
                _this.loadFeature(n);
            }
            else {
                _this.map.hideHighlight();
                _this.ractive.set('properties', []);
            }
        });
    };
    ;
    InspectorApp.prototype.clear = function () {
        this.map.hideHighlight();
        this.ractive.set('properties', []);
        this.features.splice(0);
    };
    ;
    InspectorApp.prototype.showTable = function (properties) {
        if (this.service.layer.getType) {
            var typeProperties = {};
            for (var _i = 0, _a = Object.keys(properties); _i < _a.length; _i++) {
                var key = _a[_i];
                var type = this.service.layer.getType(key);
                var f = void 0;
                if (typeof (type) === 'function') {
                    f = type(properties[key]);
                }
                else {
                    switch (type) {
                        case 'href':
                            var desc = void 0;
                            if (properties[key].length > 30) {
                                desc = properties[key].substring(0, 30) + '...';
                            }
                            else {
                                desc = properties[key];
                            }
                            f = "<a href=\"" + properties[key] + "\" target=\"_blank\">" + desc + "</a>&nbsp;<span class=\"fa fa-external-link\"></span>";
                            break;
                        case 'float':
                            f = this.numeral.float(properties[key]);
                            break;
                        case 'int':
                            f = parseInt(properties[key]).toString();
                            break;
                        case 'percentage':
                            f = this.numeral.percentage(properties[key]);
                            break;
                        case 'skip':
                            f = undefined;
                            break;
                        default:
                            f = properties[key];
                    }
                }
                if (f) {
                    typeProperties[key] = f;
                }
            }
            this.ractive.set('properties', typeProperties);
        }
        else {
            this.ractive.set({
                'properties': properties,
            });
        }
        this.ractive.update('properties'); // @todo: uitzoeken waarom dit nodig is
        this.ractive.set('error', false);
    };
    ;
    return InspectorApp;
}(ractiveApp_1.RactiveApp));
exports.InspectorApp = InspectorApp;
