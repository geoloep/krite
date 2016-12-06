"use strict";
var L = require('leaflet');
var AardbevingLayer = (function () {
    function AardbevingLayer(capabilities) {
        this.capabilities = capabilities;
        this.onClickCallbacks = [];
        this.attrTypes = {
            Lat: 'float',
            Lon: 'float',
            M: 'float',
            Diepte: function (diepte) {
                return diepte.replace('.', ',');
            },
            Link: 'href',
        };
    }
    Object.defineProperty(AardbevingLayer.prototype, "canGetInfoAtPoint", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AardbevingLayer.prototype, "hasOnClick", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AardbevingLayer.prototype, "name", {
        get: function () {
            return 'Recente aardbevingen';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AardbevingLayer.prototype, "title", {
        get: function () {
            return 'Recente aardbevingen';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AardbevingLayer.prototype, "abstract", {
        get: function () {
            return '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AardbevingLayer.prototype, "bounds", {
        get: function () {
            return this.group.getBounds();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AardbevingLayer.prototype, "preview", {
        get: function () {
            return '<p>De meest recente aardbevingen in en rondom Nederland</p>\
        <p>Copyright <a href="http://knmi.nl/" target="_blank">KNMI</a>';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AardbevingLayer.prototype, "leaflet", {
        get: function () {
            if (!(this.group)) {
                this.group = this.makeLayer();
            }
            return this.group;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AardbevingLayer.prototype, "legend", {
        get: function () {
            return '<p><span class="fa fa-bullseye" style="color: red"></span>&nbsp;Aardbeving</p>';
        },
        enumerable: true,
        configurable: true
    });
    AardbevingLayer.prototype.onClick = function (fun) {
        this.onClickCallbacks.push(fun);
    };
    AardbevingLayer.prototype.getType = function (attr) {
        if (attr in this.attrTypes) {
            return this.attrTypes[attr];
        }
        else {
            return 'string';
        }
    };
    AardbevingLayer.prototype.makeLayer = function () {
        var _this = this;
        var layers = [];
        var _loop_1 = function(aardbeving) {
            var layer = L.marker([parseFloat(aardbeving['geo:lat']), parseFloat(aardbeving['geo:lon'])], {
                icon: L.divIcon({
                    className: '',
                    html: '<span class="fa fa-bullseye fa-2x" style="color: red"></span>',
                    iconAnchor: [9, 12],
                }),
            });
            layer.on('click', function (e) {
                _this.clickHandler(aardbeving);
            });
            layers.push(layer);
        };
        for (var _i = 0, _a = this.capabilities.rss.channel.item; _i < _a.length; _i++) {
            var aardbeving = _a[_i];
            _loop_1(aardbeving);
        }
        this.group = L.featureGroup(layers);
        return this.group;
    };
    AardbevingLayer.prototype.parseAttributes = function (aardbeving) {
        var gesplitst = aardbeving.description.split(', ');
        var resultaat = {
            'Datum': gesplitst[0],
            'Tijd': gesplitst[1],
        };
        for (var i = 2; i < gesplitst.length; i++) {
            var paar = gesplitst[i].split(' = ');
            resultaat[paar[0]] = paar[1];
        }
        resultaat['Link'] = aardbeving.link;
        resultaat['Guid'] = aardbeving.guid;
        return resultaat;
    };
    AardbevingLayer.prototype.clickHandler = function (aardbeving) {
        for (var _i = 0, _a = this.onClickCallbacks; _i < _a.length; _i++) {
            var callback = _a[_i];
            callback(this, this.parseAttributes(aardbeving));
        }
    };
    ;
    return AardbevingLayer;
}());
exports.AardbevingLayer = AardbevingLayer;
