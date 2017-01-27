"use strict";
var L = require("leaflet");
var url = require("url");
var WFSLayer = (function () {
    function WFSLayer(capabilities, source) {
        this.capabilities = capabilities;
        this.source = source;
        this.ZIndex = 100;
    }
    ;
    Object.defineProperty(WFSLayer.prototype, "title", {
        get: function () {
            return this.capabilities.Title[0];
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(WFSLayer.prototype, "name", {
        get: function () {
            return this.capabilities.Name[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WFSLayer.prototype, "abstract", {
        get: function () {
            return this.capabilities.Abstract[0];
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(WFSLayer.prototype, "bounds", {
        get: function () {
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WFSLayer.prototype, "preview", {
        // get boundingBox() {
        //     let crs = 'EPSG:28992' // @todo: selecteerbaar maken?
        //     let bbox: number[] = [];
        //     for (let boundingBox of this.capabilities.BoundingBox) {
        //         if (boundingBox.crs === 'EPSG:28992') {
        //             for (let point of boundingBox.extent) {
        //                 bbox.push(point);
        //             }
        //         }
        //     }
        //     return bbox;
        // };
        // intersects(feature: string | toWKT | GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.GeometryObject) {
        //     return new Promise<any>((resolve, reject) => {
        //         let wkt: string;
        //         if (typeof feature === 'object') {
        //             if ((feature as toWKT).toWKT) {
        //                 wkt = (feature as toWKT).toWKT();
        //             } else {
        //                 wkt = wellknown.stringify(feature as GeoJSON.GeometryObject);
        //             }
        //         } else {
        //             wkt = feature;
        //         }
        //         fetch(this.source.url + url.format({
        //             query: {
        //                 cql_filter: `INTERSECTS(${this.geomField}, ${wkt})`,
        //                 outputformat: 'application/json',
        //                 request: 'GetFeature',
        //                 service: 'WFS',
        //                 typenames: this.typename,
        //                 version: '2.0.0',
        //             },
        //         })).then((response) => {
        //             if (response.ok) {
        //                 response.json().then(resolve);
        //             } else {
        //                 reject();
        //             }
        //         }).catch(reject);
        //     });
        // }
        // getInfoAtPoint(point: any): Promise<any> {
        //     return new Promise<any>(
        //         (resolve, reject) => {
        //             let typename = this.name;
        //             let field = 'geom';
        //             if (this.source.options.wfsNamespace) {
        //                 typename = this.source.options.wfsNamespace + ':' + typename;
        //             }
        //             if (this.source.options.field) {
        //                 field = this.source.options.field;
        //             }
        //             fetch(this.source.url + url.format({
        //                 query: {
        //                     cql_filter: `INTERSECTS(${field}, POINT(${point.x} ${point.y}))`,
        //                     outputformat: 'application/json',
        //                     request: 'GetFeature',
        //                     service: 'WFS',
        //                     typenames: typename,
        //                     version: '2.0.0',
        //                 },
        //             })).then((response) => {
        //                 if (response.ok) {
        //                     response.json().then(resolve);
        //                 } else {
        //                     reject();
        //                 }
        //             }).catch(reject);
        //         }
        //     );
        // };
        // getPreviewSize(bbox: number[], width: number) {
        //     let dx = bbox[2] - bbox[0];
        //     let dy = bbox[3] - bbox[1];
        //     return {
        //         height: Math.round(width * (dy / dx)),
        //         width: width,
        //     };
        // };
        get: function () {
            return '<p>' + this.abstract + '</p>';
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(WFSLayer.prototype, "leaflet", {
        get: function () {
            var _this = this;
            if (this._leaflet) {
                return this._leaflet;
            }
            else {
                this._leaflet = L.geoJSON();
                fetch(this.source.url +
                    url.format({
                        query: {
                            version: '2.0.0',
                            request: 'GetFeature',
                            typeName: this.name,
                            outputFormat: 'application/json',
                        },
                    })).then(function (response) {
                    if (response.ok) {
                        response.json().then(function (json) {
                            _this._leaflet.addData(json);
                        }).catch(function () {
                            console.error('Fout bij parsen GeoJSON WFS');
                        });
                    }
                    else {
                        console.error('Fout bij uitlezen WFS');
                    }
                }).catch(function (reason) {
                    console.error('Fout bij verbinden met WFS');
                });
                return this._leaflet;
            }
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(WFSLayer.prototype, "legend", {
        get: function () {
            // try {
            //     return `<img class="img-responsive" src="${this.capabilities.Style[0].LegendURL[0].OnlineResource}">`;
            // } catch (e) {
            //     return '<p>-</p>';
            // }
            return '-';
        },
        enumerable: true,
        configurable: true
    });
    ;
    return WFSLayer;
}());
exports.WFSLayer = WFSLayer;
