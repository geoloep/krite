"use strict";
var ServiceManager = (function () {
    function ServiceManager() {
        this.dependencies = {};
        this.promised = {};
    }
    ServiceManager.prototype.addService = function (name, service) {
        this.dependencies[name] = service;
        if (name in this.promised) {
            this.resolvePromises(name);
        }
        return service;
    };
    ServiceManager.prototype.getService = function (name) {
        console.assert(name in this.dependencies);
        return this.dependencies[name];
    };
    ServiceManager.prototype.tryService = function (name) {
        if (name in this.dependencies) {
            return this.dependencies[name];
        }
    };
    ServiceManager.prototype.promiseService = function (name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (name in _this.dependencies) {
                resolve(_this.dependencies[name]);
            }
            else {
                if (!(name in _this.promised)) {
                    _this.promised[name] = [];
                }
                _this.promised[name].push(resolve);
            }
        });
    };
    ServiceManager.prototype.hasService = function (name) {
        return (name in this.dependencies);
    };
    ServiceManager.prototype.resolvePromises = function (name) {
        console.assert(name in this.promised);
        for (var _i = 0, _a = this.promised[name]; _i < _a.length; _i++) {
            var resolve = _a[_i];
            resolve(this.getService(name));
        }
        delete this.promised[name];
    };
    return ServiceManager;
}());
exports.ServiceManager = ServiceManager;
