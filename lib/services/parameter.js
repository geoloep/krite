"use strict";
var servicePool_1 = require("../servicePool");
var ParameterService = (function () {
    function ParameterService() {
        this.parameters = {};
        this.parseSearch();
    }
    ParameterService.prototype.parseSearch = function () {
        if (window.location.search.length > 2) {
            var params = window.location.search.substring(1).split('&');
            for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
                var param = params_1[_i];
                var split = param.split('=');
                if (split.length === 2) {
                    this.parameters[decodeURI(split[0])] = decodeURI(split[1]);
                }
            }
        }
    };
    ParameterService.prototype.setLayers = function () {
        var _this = this;
        if ('source' in this.parameters && 'layer' in this.parameters) {
            servicePool_1.default.promiseService('SourceService').then(function (sources) {
                servicePool_1.default.promiseService('MapService').then(function (map) {
                    var source = sources.sources[_this.parameters['source']];
                    if (source) {
                        source.getLayer(_this.parameters['layer']).then(function (layer) {
                            map.addLayer(layer);
                            if ('fitBounds' in _this.parameters) {
                                map.fitBounds(layer.bounds);
                            }
                        });
                    }
                });
            });
        }
    };
    ParameterService.prototype.setApp = function () {
        var _this = this;
        if ('app' in this.parameters) {
            servicePool_1.default.promiseService('SidebarService').then(function (sidebar) {
                sidebar.setApp(_this.parameters['app']);
            });
        }
    };
    return ParameterService;
}());
exports.ParameterService = ParameterService;
