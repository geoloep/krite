"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Ractive = require("ractive");
var ractiveApp_1 = require("../ractiveApp");
var servicePool_1 = require("../../servicePool");
var BasemapApp = (function (_super) {
    __extends(BasemapApp, _super);
    function BasemapApp(element) {
        var _this = _super.call(this) || this;
        _this.element = element;
        _this.map = servicePool_1.default.getService('MapService');
        _this.service = servicePool_1.default.getService('BasemapService');
        _super.prototype.init.call(_this, element);
        return _this;
    }
    BasemapApp.prototype.createRactive = function (element) {
        var _this = this;
        this.ractive = new Ractive({
            append: true,
            modifyArrays: true,
            el: element,
            template: require('./template.html'),
            data: {
                basemaps: this.service.list,
            },
        });
        this.ractive.on('setBasemap', function (e) {
            var context = e.get();
            _this.map.setBaseMap(context.url, context.options);
        });
    };
    return BasemapApp;
}(ractiveApp_1.RactiveApp));
exports.BasemapApp = BasemapApp;
