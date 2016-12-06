"use strict";
var SidebarServiceApp = (function () {
    function SidebarServiceApp(name, label, icon) {
        this.name = name;
        this.label = label;
        this.icon = icon;
    }
    SidebarServiceApp.prototype.register = function (app) {
        this.app = app;
    };
    SidebarServiceApp.prototype.deregister = function () {
        delete this.app;
    };
    return SidebarServiceApp;
}());
exports.SidebarServiceApp = SidebarServiceApp;
var SidebarService = (function () {
    function SidebarService(target) {
        this.target = target;
        this.apps = {};
        this.onChangeCallbacks = [];
    }
    SidebarService.prototype.addApp = function (app) {
        this.apps[app.name] = app;
        return app;
    };
    SidebarService.prototype.setApp = function (appName) {
        if (this.apps[appName] && this.apps[appName].app) {
            if (this.activeApp) {
                this.activeApp.app.detatch();
            }
            this.activeApp = this.apps[appName];
            this.activeApp.app.insert(this.target);
            this.activeName = appName;
            this.onChange();
        }
        else {
            console.warn("Tried to set unkown app: " + appName);
        }
    };
    SidebarService.prototype.registerOnChange = function (func) {
        this.onChangeCallbacks.push(func);
    };
    SidebarService.prototype.onChange = function () {
        for (var _i = 0, _a = this.onChangeCallbacks; _i < _a.length; _i++) {
            var c = _a[_i];
            c();
        }
    };
    return SidebarService;
}());
exports.SidebarService = SidebarService;
