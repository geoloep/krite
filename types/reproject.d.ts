declare namespace reproject {
    export function reproject(geojson: any, from: any, to: any, crss?: any): any;
    export function toWgs84(geojson: any, from: any, crss?: any): any;
    export function detectCrs(geojson: any, crss: any): any;
    export function reverse(geojson: any): any;
}

declare module 'reproject' {
    export = reproject
}