"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
require("leaflet-draw");
var L = require("leaflet");
var servicePool_1 = require("../servicePool");
var DrawService = (function () {
    function DrawService() {
        var _this = this;
        this.lock = false;
        (function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, servicePool_1.default.promiseService('MapService')];
                    case 1:
                        _a.service = _c.sent();
                        _b = this;
                        return [4 /*yield*/, servicePool_1.default.promiseService('ProjectService')];
                    case 2:
                        _b.project = _c.sent();
                        return [2 /*return*/];
                }
            });
        }); })();
    }
    DrawService.prototype.disable = function () {
        if (this.drawFeature) {
            this.drawFeature.disable();
        }
    };
    DrawService.prototype.rectangle = function () {
        return this.draw(new L.Draw.Rectangle(this.service.map, {}));
    };
    DrawService.prototype.polyline = function () {
        return this.draw(new L.Draw.Polyline(this.service.map, {}));
    };
    DrawService.prototype.polygon = function () {
        return this.draw(new L.Draw.Polygon(this.service.map, {}));
    };
    DrawService.prototype.draw = function (draw) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.service && _this.project) {
                if (!_this.lock) {
                    _this.lock = true;
                    draw.enable();
                    // Only seems to fire when valid geometry is created
                    _this.service.map.once('draw:created', function (event) {
                        resolve(_this.project.from(event.layer.toGeoJSON()));
                    });
                    // Release lock when draw actions have completed, even when valid geometry was not created
                    _this.service.map.once('draw:drawstop', function (event) {
                        _this.lock = false;
                    });
                }
                else {
                    reject('Draw already in progress');
                }
            }
            else {
                reject('DrawService requires both MapService and ProjectService to be available');
            }
        });
    };
    return DrawService;
}());
exports.DrawService = DrawService;
