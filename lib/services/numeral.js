"use strict";
var numeral = require('numeral');
var NumeralService = (function () {
    function NumeralService(locale) {
        this.numeral = numeral;
        this.setLocale(locale);
    }
    NumeralService.prototype.setLocale = function (locale) {
        this.numeral.locale(locale);
    };
    NumeralService.prototype.number = function (n) {
        return numeral(n);
    };
    NumeralService.prototype.float = function (n) {
        return numeral(parseFloat(n)).format('(0,0.00)');
    };
    NumeralService.prototype.int = function (n) {
        return numeral(parseFloat(n)).format('(0,0)');
    };
    NumeralService.prototype.percentage = function (n) {
        return numeral(parseFloat(n) / 100).format('0%');
    };
    return NumeralService;
}());
exports.NumeralService = NumeralService;
