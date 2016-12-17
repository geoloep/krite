"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Ractive = require('ractive');
var ractiveApp_1 = require('../ractiveApp');
var servicePool_1 = require('../../servicePool');
var LegendApp = (function (_super) {
    __extends(LegendApp, _super);
    function LegendApp(element) {
        _super.call(this);
        this.element = element;
        this.map = servicePool_1.default.getService('MapService');
        this.inspector = servicePool_1.default.getService('InspectorService');
        this.sidebar = servicePool_1.default.getService('SidebarService');
        this.buttonStates = {};
        this.legendState = {};
        _super.prototype.init.call(this, element);
    }
    ;
    LegendApp.prototype.createRactive = function (element) {
        var _this = this;
        this.ractive = new Ractive({
            //magic: true, // @todo: in 0.8.0 weer proberen
            modifyArrays: true,
            el: element,
            template: require('./template.html'),
            partials: {
                button: require('./button.html'),
            },
            data: {
                items: this.map.layers,
                getButtons: function (layerName) {
                    if (!(layerName in _this.buttonStates)) {
                        _this.buttonStates[layerName] = _this.bindButtons(layerName);
                    }
                    return _this.buttonStates[layerName];
                },
                legendState: this.legendState,
                getLegendState: function (layerName, legendState) {
                    if (!(layerName in legendState)) {
                        legendState[layerName] = true;
                    }
                    return legendState[layerName];
                },
            },
        });
        this.ractive.on('bla', function (e) {
            var context = e.get();
            if (context.flipable) {
                e.toggle('disabled');
            }
            if (context.action) {
                context.action(e);
            }
        });
    };
    ;
    LegendApp.prototype.bindButtons = function (layerName) {
        var _this = this;
        return [
            {
                icon: 'angle-double-up',
                flipable: false,
                disabled: false,
                hidden: false,
                action: function (e) {
                    var layer = _this.map.layerByName[layerName];
                    _this.map.removeLayer(layer);
                    _this.map.addLayer(layer);
                },
            },
            {
                icon: 'list',
                flipable: true,
                disabled: false,
                hidden: false,
                action: function (e) {
                    _this.legendState[layerName] = !(e.get('disabled'));
                    _this.ractive.update('legendState'); // @todo: kan dat niet beter?
                },
            },
            {
                icon: 'eye',
                flipable: true,
                disabled: false,
                hidden: false,
                action: function (e) {
                    if (e.get('disabled')) {
                        _this.map.hideLayer(_this.map.layerByName[layerName]);
                    }
                    else {
                        _this.map.showLayer(_this.map.layerByName[layerName]);
                    }
                },
            },
            {
                icon: 'question-circle',
                flipable: false,
                disabled: false,
                hidden: true,
                action: function (e) {
                    _this.inspector.layer = _this.map.layerByName[layerName];
                    _this.sidebar.setApp('InspectorApp');
                },
            },
            {
                icon: 'trash',
                flipable: false,
                disabled: false,
                hidden: true,
                action: function (e) {
                    _this.map.removeLayer(_this.map.layerByName[layerName]);
                },
            },
        ];
    };
    ;
    return LegendApp;
}(ractiveApp_1.RactiveApp));
exports.LegendApp = LegendApp;
;
