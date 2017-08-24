import * as L from 'leaflet';
import { IProjectionService } from '../types';

/**
 * This service simply passes the input geometries without any reprojection
 */
export class ProjectLatLngService implements IProjectionService {
    identifiers = {
        leaflet: 'EPSG:4326',
        krite: 'EPSG:4326',
    };

    geoTo(geojson: GeoJSON.GeoJsonObject | GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | GeoJSON.GeometryCollection) {
        return geojson;
    }

    geoFrom(geojson: GeoJSON.GeoJsonObject | GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | GeoJSON.GeometryCollection) {
        return geojson;
    }

    pointTo(point: L.Point) {
        return this.unproject(point);
    }

    pointFrom(latLng: L.LatLng) {
        return this.project(latLng);
    }

    project(latLng: L.LatLng) {
        return L.Projection.LonLat.project(latLng);
    }

    unproject(point: L.Point) {
        return L.Projection.LonLat.unproject(point);
    }
}
