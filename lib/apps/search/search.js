"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Ractive = require('ractive');
var ractiveApp_1 = require('../ractiveApp');
var servicePool_1 = require('../../servicePool');
var SearchApp = (function (_super) {
    __extends(SearchApp, _super);
    function SearchApp(element) {
        var _this = this;
        _super.call(this);
        this.map = servicePool_1.default.getService('MapService');
        this.geocode = servicePool_1.default.getService('GeocodeService');
        this.timeOutLength = 500;
        this.diepteNaarZoom = {
            'Building': 12,
            'Street': 12,
            'MunicipalitySubdivision': 8,
            'MunicipalityCapital': 8,
            'Municipality': 8,
            'CountrySubdivision': 5,
        };
        this.depthOrder = [
            'Building',
            'MunicipalitySubdivision',
            'Street',
            'Municipality',
            'CountrySubdivision',
        ];
        this.search = function (searchString) {
            _this.geocode.search(searchString).then(_this.searchSuccess).catch(_this.searchFail);
        };
        this.searchSuccess = function (data) {
            _this.ractive.set('results', data);
            _this.selectReset();
        };
        this.searchFail = function () {
            console.error('Fout bij zoeken');
        };
        this.selectDown = function () {
            var nextNum = _this.ractive.get('currentNum') + 1;
            var currentDepth = _this.ractive.get('currentDepth');
            if (_this.ractive.get('results.' + currentDepth + '.' + nextNum)) {
                // Volgende nummer bestaat binnen de huidige diepte
                _this.ractive.set('currentNum', nextNum);
            }
            else {
                // Volgende dieptes proberen
                if (_this.depthOrder.indexOf(currentDepth) + 1) {
                    for (var i = _this.depthOrder.indexOf(currentDepth) + 1; i < _this.depthOrder.length; i++) {
                        var nextDepth = _this.depthOrder[i];
                        if (_this.ractive.get('results.' + nextDepth)) {
                            _this.ractive.set('currentDepth', nextDepth);
                            _this.ractive.set('currentNum', 0);
                            break;
                        }
                    }
                }
            }
        };
        this.selectUp = function () {
            var nextNum = _this.ractive.get('currentNum') - 1;
            var currentDepth = _this.ractive.get('currentDepth');
            if (_this.ractive.get('results.' + currentDepth + '.' + nextNum)) {
                // Vorige nummer bestaat binnen de huidige diepte
                _this.ractive.set('currentNum', nextNum);
            }
            else {
                // Vorige dieptes proberen
                if (_this.depthOrder.indexOf(currentDepth) - 1) {
                    for (var i = _this.depthOrder.indexOf(currentDepth) - 1; i >= 0; i--) {
                        var nextDepth = _this.depthOrder[i];
                        var results = _this.ractive.get('results.' + nextDepth);
                        if (results) {
                            _this.ractive.set('currentDepth', nextDepth);
                            _this.ractive.set('currentNum', results.length - 1);
                            break;
                        }
                    }
                }
            }
        };
        _super.prototype.init.call(this, element);
    }
    ;
    SearchApp.prototype.createRactive = function (element) {
        // let this = this;
        var _this = this;
        this.ractive = new Ractive({
            append: true,
            data: {
                currentDepth: 'Building',
                currentNum: 0,
                dropdown: false,
                results: {},
                searchString: '',
            },
            el: element,
            modifyArrays: true,
            template: require('./template.html'),
        });
        this.ractive.on('input-focus', function (e) {
            _this.ractive.set('dropdown', true);
        });
        this.ractive.on('input-blur', function (e) {
            _this.ractive.set('dropdown', false);
        });
        this.ractive.observe('searchString', function (n, o, k) {
            if (_this.searchTimeOut) {
                window.clearTimeout(_this.searchTimeOut);
            }
            if (n && n !== '') {
                _this.searchTimeOut = window.setTimeout(_this.search, _this.timeOutLength, n);
            }
        });
        this.ractive.on('searchClick', function (e) {
            _this.searchClick(e.get());
        });
        this.ractive.on('input-keyup', function (e) {
            if (e.original.key === 'ArrowDown') {
                e.original.preventDefault();
                _this.selectDown();
            }
            else if (e.original.key === 'ArrowUp') {
                e.original.preventDefault();
                _this.selectUp();
            }
            else if (e.original.key === 'Enter') {
                // @todo: dropdown wel of niet sluiten?
                e.original.preventDefault();
                var context = _this.ractive.get('results.' + _this.ractive.get('currentDepth') + '.' + _this.ractive.get('currentNum'));
                if (context) {
                    _this.searchClick(context);
                }
            }
            else if (e.original.key === 'Escape') {
                _this.ractive.toggle('dropdown');
            }
        });
    };
    ;
    SearchApp.prototype.searchClick = function (context) {
        this.map.zoomToPoint(context.Point.pos, this.diepteNaarZoom[context.Depth]);
    };
    ;
    SearchApp.prototype.selectReset = function () {
        this.ractive.set('currentDepth', 0);
        for (var i = 0; i < this.depthOrder.length; i++) {
            if (this.ractive.get('results.' + this.depthOrder[i])) {
                this.ractive.set('currentDepth', this.depthOrder[i]);
                break;
            }
        }
    };
    ;
    return SearchApp;
}(ractiveApp_1.RactiveApp));
exports.SearchApp = SearchApp;
