"use strict";
/**
 * All apps should extend from this class
 */
var RactiveApp = (function () {
    function RactiveApp() {
    }
    // @todo: init en insert weer samenvoegen?
    RactiveApp.prototype.init = function (element) {
        // if (this.container) {
        //     this.container.deregister();
        // }
        if (element) {
            if (typeof (element) === 'object' && element.register) {
                element.register(this);
            }
            else if (typeof (element) === 'string') {
                this.insert(element);
            }
        }
    };
    RactiveApp.prototype.insert = function (element) {
        if (element) {
            if (typeof (element) === 'object' && element.register) {
                this.init(element);
            }
            else if (typeof (element) === 'string') {
                if (this.ractive) {
                    this.ractive.insert(element);
                }
                else {
                    this.createRactive(element);
                }
            }
        }
    };
    ;
    RactiveApp.prototype.detatch = function () {
        if (this.ractive) {
            this.ractive.detach();
        }
    };
    ;
    RactiveApp.prototype.createRactive = function (element) {
        console.error('createRactive not implemented for RactiveApp');
    };
    ;
    return RactiveApp;
}());
exports.RactiveApp = RactiveApp;
