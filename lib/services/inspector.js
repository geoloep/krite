"use strict";
var InspectorService = (function () {
    function InspectorService() {
    }
    Object.defineProperty(InspectorService.prototype, "name", {
        get: function () {
            if (this.layer && this.layer.name) {
                return this.layer.name;
            }
            else {
                return '';
            }
        },
        enumerable: true,
        configurable: true
    });
    return InspectorService;
}());
exports.InspectorService = InspectorService;
;
