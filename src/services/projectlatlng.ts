import * as L from 'leaflet';

/**
 * This service simply passes the input geometries without any reprojection
 */
export class ProjectLatLngService {
    /**
     * Create a ProjectLatLngService instance
     * @param reverse Reverse latitude and longitude during projecting
     */
    constructor(readonly reverse: boolean = true) {

    }

    to(geojson: GeoJSON.GeoJsonObject | GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | GeoJSON.GeometryCollection) {
        return geojson;
    }

    from(geojson: GeoJSON.GeoJsonObject | GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | GeoJSON.GeometryCollection) {
        return geojson;
    }

    project(latLng: L.LatLng) {
        if (this.reverse) {
            return L.point(latLng.lat, latLng.lng);
        } else {
            return L.Projection.LonLat.project(latLng);
        }
    }

    unproject(point: L.Point) {
        return L.Projection.LonLat.unproject(point);
    }
}
