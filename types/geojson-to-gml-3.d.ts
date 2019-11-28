declare module 'geojson-to-gml-3' {
    export function geomToGml(geom: GeoJSON.Geometry, gmlId?: string, params?: any, gmldIds?: Array<number | string>): string;
}