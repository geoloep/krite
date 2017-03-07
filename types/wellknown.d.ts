declare namespace wellknown {
    export function parse(wkt: string): GeoJSON.DirectGeometryObject;
    export function stringify(geojson: GeoJSON.GeoJsonObject | GeoJSON.Feature<GeoJSON.GeometryObject>): string
}

declare module 'wellknown' {
    export = wellknown;
}