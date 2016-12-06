"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Ractive = require('ractive');
var ractiveApp_1 = require('../ractiveApp');
var servicePool_1 = require('../../servicePool');
var ControlApp = (function (_super) {
    __extends(ControlApp, _super);
    function ControlApp(element) {
        var _this = this;
        _super.call(this);
        this.element = element;
        this.service = servicePool_1.default.getService('SidebarService');
        this.onChange = function () {
            _this.ractive.update('apps');
            _this.ractive.set('active', _this.service.activeName);
        };
        this.activate = function (e) {
            _this.service.setApp(e.resolve().split('.').pop());
        };
        _super.prototype.init.call(this, element);
        this.service.registerOnChange(this.onChange);
    }
    ;
    ControlApp.prototype.createRactive = function (element) {
        this.ractive = new Ractive({
            append: true,
            modifyArrays: true,
            el: element,
            template: require('./template.html'),
            data: {
                active: this.service.activeName,
                apps: this.service.apps,
                activate: this.service.setApp,
            },
        });
        this.ractive.on('activate', this.activate);
    };
    ;
    return ControlApp;
}(ractiveApp_1.RactiveApp));
exports.ControlApp = ControlApp;
