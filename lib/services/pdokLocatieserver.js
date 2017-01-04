"use strict";
var PdokLocatieserverService = (function () {
    function PdokLocatieserverService() {
    }
    PdokLocatieserverService.prototype.search = function (searchString) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch("http://geodata.nationaalgeoregister.nl/locatieserver/suggest?q=" + searchString).then(function (response) {
                if (response.ok) {
                    response.json().then(function (json) {
                        resolve(_this.parseResponse(json));
                    }).catch(function (reason) {
                        reject(reason);
                    });
                }
                else {
                    reject();
                }
            }).catch(function (reason) {
                reject(reason);
            });
        });
    };
    PdokLocatieserverService.prototype.inspect = function (id) {
        return new Promise(function (resolve, reject) {
            fetch("http://geodata.nationaalgeoregister.nl/locatieserver/lookup?id=" + id).then(function (response) {
                if (response.ok) {
                    response.json().then(resolve).catch(reject);
                }
                else {
                    reject();
                }
            }).catch(function (reason) {
                reject(reason);
            });
        });
    };
    PdokLocatieserverService.prototype.parseResponse = function (response) {
        var parsed = {};
        for (var _i = 0, _a = response.response.docs; _i < _a.length; _i++) {
            var doc = _a[_i];
            if (!(doc.type in parsed)) {
                parsed[doc.type] = [];
            }
            if (doc.id in response.highlighting && response.highlighting[doc.id].suggest.length > 0) {
                doc.suggest = response.highlighting[doc.id].suggest[0];
            }
            else {
                doc.suggest = doc.weergavenaam;
            }
            parsed[doc.type].push(doc);
        }
        return parsed;
    };
    return PdokLocatieserverService;
}());
exports.PdokLocatieserverService = PdokLocatieserverService;
