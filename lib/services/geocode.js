"use strict";
var $ = require('jquery');
var geocodeParser = require('../../../openls-geocode-parser'); // @todo: pakket van maken
var GeocodeService = (function () {
    function GeocodeService(baseurl) {
        this.baseurl = baseurl;
    }
    GeocodeService.prototype.search = function (searchString) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            $.get(_this.baseurl, {
                zoekterm: searchString
            }, $.noop, 'text').done(function (data) {
                geocodeParser(data, function (resp) {
                    resolve(resp);
                }, function () {
                    reject('Parse Error');
                });
            }).fail(function () {
                reject('Ajax Error');
            });
        });
    };
    return GeocodeService;
}());
exports.GeocodeService = GeocodeService;
