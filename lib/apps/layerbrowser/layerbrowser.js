"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Ractive = require("ractive");
var ractiveApp_1 = require("../ractiveApp");
var servicePool_1 = require("../../servicePool");
var LayerBrowserApp = (function (_super) {
    __extends(LayerBrowserApp, _super);
    function LayerBrowserApp(element) {
        var _this = _super.call(this) || this;
        _this.selectedSource = '';
        _this.service = servicePool_1.default.getService('SourceService');
        _this.map = servicePool_1.default.getService('MapService');
        _this.sidebar = servicePool_1.default.tryService('SidebarService');
        _this.selectedLayer = {
            abstract: 'Kies een databron en vervolgens een kaartlaag om informatie aan de kaart toe te voegen.',
            preview: '',
            name: '',
            title: 'Selecteer een laag',
        };
        _super.prototype.init.call(_this, element);
        return _this;
    }
    LayerBrowserApp.prototype.createRactive = function (element) {
        var _this = this;
        this.ractive = new Ractive({
            // magic: true,
            el: element,
            modifyArrays: true,
            template: require('./template.html'),
            data: {
                layerFilter: '',
                layerList: [],
                sourceLoading: false,
                layerLoading: false,
                layerAddable: false,
                sourceList: this.service.sourceList,
                selectedLayer: this.selectedLayer,
                selectedSource: this.selectedSource,
                filteredLayerList: function (layerList, filter) {
                    var listOut = [];
                    for (var _i = 0, layerList_1 = layerList; _i < layerList_1.length; _i++) {
                        var layer = layerList_1[_i];
                        if (layer.indexOf(filter) >= 0) {
                            listOut.push(layer);
                        }
                    }
                    return listOut;
                },
            },
        });
        this.ractive.observe('selectedSource', function (newValue) {
            if (newValue && newValue !== '') {
                _this.ractive.set({
                    loading: true,
                    selectedLayer: _this.selectedLayer,
                    layerAddable: false,
                });
                _this.service.sources[newValue].getLayerNames().then(function (layerList) {
                    _this.ractive.set({
                        layerList: layerList,
                        loading: false,
                    });
                });
            }
            else {
                _this.ractive.set({
                    layerList: [],
                    loading: false,
                });
            }
        });
        this.ractive.on('selectLayer', function (e) {
            _this.ractive.set('layerLoading', true);
            _this.service.sources[_this.ractive.get('selectedSource')].getLayer(e.get())
                .then(function (layer) {
                _this.ractive.set({
                    layerLoading: false,
                    layerAddable: true,
                    selectedLayer: layer,
                });
            })
                .catch(function (reason) {
                console.error(reason);
            });
        });
        this.ractive.on('addLayer', function (e) {
            _this.map.addLayer(_this.ractive.get('selectedLayer'));
            if (_this.sidebar) {
                _this.sidebar.setApp('LegendApp');
            }
        });
    };
    return LayerBrowserApp;
}(ractiveApp_1.RactiveApp));
exports.LayerBrowserApp = LayerBrowserApp;
