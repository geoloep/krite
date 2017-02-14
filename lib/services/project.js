"use strict";
var proj4 = require("proj4");
var reproject = require("reproject");
/**
 * Reproject GeoJSON between map and krite crs
 */
var ProjectService = (function () {
    function ProjectService(def) {
        this.def = def;
    }
    /**
     * reproject from the krite crs to wgs84
     */
    ProjectService.prototype.to = function (geojson) {
        return reproject.toWgs84(geojson, this.def);
    };
    /**
     * reproject from wgs84 tot the krite crs
     */
    ProjectService.prototype.from = function (geojson) {
        return reproject.reproject(geojson, proj4.WGS84, this.def);
    };
    return ProjectService;
}());
exports.ProjectService = ProjectService;
