import * as L from 'leaflet';
import { IProjectionService } from '../types';

/**
 * This projection service assumes the use of a Web Mercator projecction in leaflet and WGS/Latlng in krite and is
 * suitable for most projects
 */
export class ProjectWebMercatorService implements IProjectionService {
    identifiers = {
        leaflet: 'EPSG:3857',
        krite: 'EPSG:4326',
    };

    /**
     * Create a ProjectLatLngService instance
     * @param reverse Reverse latitude and longitude during projecting
     */
    constructor(readonly reverse: boolean = true) {
    }

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
        if (this.reverse) {
            return L.point(latLng.lat, latLng.lng);
        } else {
            return this.project(latLng);
        }
    }

    project(latLng: L.LatLng) {
        return L.Projection.SphericalMercator.project(latLng);
    }

    unproject(point: L.Point) {
        return L.Projection.SphericalMercator.unproject(point);
    }
}
