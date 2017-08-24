import proj4 from 'proj4';
import * as reproject from 'reproject';
import { IProjectionService } from '../types';

/**
 * Reproject GeoJSON between map and krite crs
 */
export class ProjectService implements IProjectionService {
    identifiers = {
        leaflet: '',
        krite: '',
    };

    constructor(readonly crs: L.CRS, readonly def: string) {
        this.identifiers.leaflet = crs.code;
        this.identifiers.krite = crs.code;
    }

    /**
     * reproject from the krite crs to wgs84
     */
    geoTo(geojson: GeoJSON.GeoJsonObject | GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | GeoJSON.GeometryCollection) {
        return reproject.toWgs84(geojson, this.def);
    }

    /**
     * reproject from wgs84 tot the krite crs
     */
    geoFrom(geojson: GeoJSON.GeoJsonObject | GeoJSON.Feature<GeoJSON.GeometryObject> | GeoJSON.FeatureCollection<GeoJSON.GeometryObject> | GeoJSON.GeometryCollection) {
        return reproject.reproject(geojson, proj4.WGS84, this.def);
    }

    pointTo(point: L.Point) {
        return this.unproject(point);
    }

    pointFrom(latLng: L.LatLng) {
        return this.project(latLng);
    }

    /**
     * Wrapper of the projection.project function
     * @param latLng LatLng as returned from leaflet
     */
    project(latLng: L.LatLng) {
        return this.crs.projection.project(latLng);
    }

    /**
     * Wrapper of the projection.unproject function
     * @param point Coordinates in the krite crs
     */
    unproject(point: L.Point) {
        return this.crs.projection.unproject(point);
    }
}
