"use strict";
var numeral = require('numeral');
var NumeralService = (function () {
    function NumeralService(language) {
        this.numeral = numeral;
        this.setLanguage(language);
    }
    NumeralService.prototype.setLanguage = function (language) {
        this.numeral.language('krite', language);
        this.numeral.language('krite');
    };
    NumeralService.prototype.number = function (n) {
        return numeral(n);
    };
    NumeralService.prototype.float = function (n) {
        return numeral(parseFloat(n)).format('(0,0.00)');
    };
    NumeralService.prototype.percentage = function (n) {
        return numeral(parseFloat(n) / 100).format('0%');
    };
    return NumeralService;
}());
exports.NumeralService = NumeralService;
