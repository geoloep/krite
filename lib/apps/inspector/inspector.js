"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Ractive = require('ractive');
var ractiveApp_1 = require('../ractiveApp');
var servicePool_1 = require('../../servicePool');
var InspectorApp = (function (_super) {
    __extends(InspectorApp, _super);
    function InspectorApp(element) {
        var _this = this;
        _super.call(this);
        this.element = element;
        this.visible = false;
        this.map = servicePool_1.default.getService('MapService');
        this.service = servicePool_1.default.getService('InspectorService');
        this.numeral = servicePool_1.default.getService('NumeralService');
        this.sidebar = servicePool_1.default.tryService('SidebarService');
        this.active = false;
        this.onClick = function (point) {
            if (_this.active && _this.visible && _this.service.layer.canGetInfoAtPoint && _this.service.layer.getInfoAtPoint) {
                _this.service.layer.getInfoAtPoint(point)
                    .then(function (data) {
                    if (data.totalFeatures > 0) {
                        var feature = data.features[0];
                        _this.map.addHighlight(feature);
                        _this.showTable(feature.properties);
                    }
                })
                    .catch(function (reason) {
                    _this.ractive.set('error', true);
                });
            }
        };
        this.onLayerClick = function (layer, attr) {
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
        this.show = function (data) {
            if (data.totalFeatures > 0) {
                var feature = data.features[0];
                _this.map.addHighlight(feature);
                _this.showTable(feature.properties);
            }
        };
        _super.prototype.init.call(this, element);
        this.map.onClick(this.onClick);
        this.map.onLayerClick(this.onLayerClick);
    }
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
        this.ractive.set('error', false);
    };
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
                allowed: false,
                properties: {},
                error: false,
            },
        });
        this.ractive.observe('layer', function (n) {
            _this.service.layer = _this.map.layerByName[n];
            if (_this.service.layer && (_this.service.layer.canGetInfoAtPoint || _this.service.layer.hasOnClick)) {
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
    };
    ;
    return InspectorApp;
}(ractiveApp_1.RactiveApp));
exports.InspectorApp = InspectorApp;
