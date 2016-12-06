"use strict";
var servicePool_1 = require('../servicePool');
var ContainerService = (function () {
    function ContainerService(wide, narrow) {
        var _this = this;
        this.wide = wide;
        this.narrow = narrow;
        this.onStateChange = function (state) {
            if (_this.app) {
                _this.app.detatch();
                if (state === 'wide') {
                    _this.app.insert(_this.wide);
                }
                else {
                    _this.app.insert(_this.narrow);
                }
            }
        };
        servicePool_1.default.promiseService('WindowService').then(function (service) {
            service.onStateChange(_this.onStateChange);
        });
    }
    ContainerService.prototype.register = function (app) {
        this.app = app;
    };
    ContainerService.prototype.deregister = function () {
        delete this.app;
    };
    return ContainerService;
}());
exports.ContainerService = ContainerService;
