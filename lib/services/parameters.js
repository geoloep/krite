"use strict";
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
                this.parameters[split[0]] = split[1];
            }
        }
    };
    return ParameterService;
}());
exports.ParameterService = ParameterService;
