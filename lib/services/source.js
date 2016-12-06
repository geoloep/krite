"use strict";
var SourceService = (function () {
    function SourceService() {
        this.sources = {};
        this.sourceList = [];
    }
    SourceService.prototype.add = function (name, source) {
        this.sources[name] = source;
        this.sourceList.push(name);
    };
    ;
    return SourceService;
}());
exports.SourceService = SourceService;
