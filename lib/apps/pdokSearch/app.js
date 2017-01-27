"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Ractive = require("ractive");
var wellknown = require("wellknown");
var ractiveApp_1 = require("../ractiveApp");
var servicePool_1 = require("../../servicePool");
var PdokSearchApp = (function (_super) {
    __extends(PdokSearchApp, _super);
    function PdokSearchApp(element) {
        var _this = _super.call(this) || this;
        _this.map = servicePool_1.default.getService('MapService');
        _this.locatieserver = servicePool_1.default.getService('PdokLocatieserverService');
        _this.timeOutLength = 500;
        _this.diepteNaarZoom = {
            adres: 12,
            weg: 12,
            woonplaats: 8,
            gemeente: 8,
        };
        _this.depthOrder = [
            'adres',
            'woonplaats',
            'weg',
            'gemeente',
        ];
        _this.search = function (searchString) {
            _this.locatieserver.search(searchString).then(function (response) {
                _this.searchSuccess(response);
            }).catch(_this.searchFail);
        };
        _this.searchSuccess = function (data) {
            _this.ractive.set('results', data);
            _this.selectReset();
        };
        _this.searchFail = function () {
            console.error('Fout bij zoeken');
        };
        _this.selectDown = function () {
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
        _this.selectUp = function () {
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
        _super.prototype.init.call(_this, element);
        return _this;
    }
    ;
    PdokSearchApp.prototype.createRactive = function (element) {
        // let this = this;
        var _this = this;
        this.ractive = new Ractive({
            append: true,
            data: {
                currentDepth: 'adres',
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
    PdokSearchApp.prototype.searchClick = function (context) {
        var _this = this;
        // this.map.zoomToPoint(context.Point.pos, this.diepteNaarZoom[(context.Depth as string)]);
        this.locatieserver.inspect(context.id).then(function (response) {
            var geojson = wellknown.parse(response.response.docs[0].centroide_rd);
            _this.map.zoomToPoint(geojson.coordinates, _this.diepteNaarZoom[context.type]);
        });
    };
    ;
    PdokSearchApp.prototype.selectReset = function () {
        this.ractive.set('currentDepth', 0);
        for (var i = 0; i < this.depthOrder.length; i++) {
            if (this.ractive.get('results.' + this.depthOrder[i])) {
                this.ractive.set('currentDepth', this.depthOrder[i]);
                break;
            }
        }
    };
    ;
    return PdokSearchApp;
}(ractiveApp_1.RactiveApp));
exports.PdokSearchApp = PdokSearchApp;
