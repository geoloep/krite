"use strict";
var WindowService = (function () {
    function WindowService() {
        var _this = this;
        this.stateChangeCallbacks = [];
        this.setState = function () {
            if (window.innerWidth > 991) {
                _this.stateChange('wide');
            }
            else {
                _this.stateChange('narrow');
            }
        };
        this.setState();
        window.onresize = this.setState;
    }
    WindowService.prototype.onStateChange = function (func) {
        this.stateChangeCallbacks.push(func);
        func(this.state);
    };
    WindowService.prototype.stateChange = function (newState) {
        if (newState !== this.state) {
            this.state = newState;
            this.stateChanged();
        }
    };
    WindowService.prototype.stateChanged = function () {
        for (var _i = 0, _a = this.stateChangeCallbacks; _i < _a.length; _i++) {
            var callback = _a[_i];
            callback(this.state);
        }
    };
    return WindowService;
}());
exports.WindowService = WindowService;
