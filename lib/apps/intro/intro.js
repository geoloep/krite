"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Ractive = require("ractive");
var ractiveApp_1 = require("../ractiveApp");
var IntroApp = (function (_super) {
    __extends(IntroApp, _super);
    function IntroApp(element) {
        var _this = _super.call(this) || this;
        _this.element = element;
        _super.prototype.init.call(_this, element);
        return _this;
    }
    ;
    IntroApp.prototype.createRactive = function (element) {
        this.ractive = new Ractive({
            append: true,
            modifyArrays: true,
            el: element,
            template: require('./template.html'),
        });
    };
    ;
    return IntroApp;
}(ractiveApp_1.RactiveApp));
exports.IntroApp = IntroApp;
