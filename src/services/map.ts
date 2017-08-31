import * as L from 'leaflet';
// import * as reproject from 'reproject';

import pool from '../servicePool';
import { ProjectService } from './project';

import { IClickHandler, ILayer, ILayerClickHandler } from '../types';

export interface ICustomMapOptions {
    checkZoom?: boolean;
}

interface IMapOptions {
    checkZoom: boolean;
}

/**
 * This service controls the leaflet map.
 */
export class MapService {
    HTMLElement: HTMLElement;

    layers: ILayer[] = [];
    layerByName: {
        [index: string]: ILayer,
    } = {};

    map: L.Map;

    defaultLeafletOptions: L.MapOptions = {
        // crs: rd,
    };

    private mapOptions: IMapOptions = {
        checkZoom: false,
    };

    // Lagen bijhouden
    private basemap: L.Layer;
    private highlight: L.GeoJSON;
    private focus: L.GeoJSON;
    private pointer: L.Marker;

    private project = pool.getService<ProjectService>('ProjectService');

    private clickHandlers: IClickHandler[] = [];
    private layerClickCallbacks: ILayerClickHandler[] = [];

    constructor(readonly element: string, readonly customOptions?: L.MapOptions, mapOptions?: ICustomMapOptions) {
        this.map = L.map((this.element as any),
            Object.assign(this.defaultLeafletOptions, this.customOptions),
        );

        this.mapOptions = Object.assign(this.mapOptions, mapOptions);

        this.map.on('click', (e: L.MouseEvent) => {
            // latlng does not exist on KeyBoardevents. Enter may fire click'
            if (e.latlng) {
                for (const func of this.clickHandlers) {
                    func(this.project.pointFrom(e.latlng));
                }
            }
        });

        if (this.mapOptions.checkZoom) {
            this.map.on('zoomend', () => {
                this.checkZoom();
            });
        }

        // @todo: is dit element gegarandeerd aanwezig op dit moment?
        this.HTMLElement = document.querySelector('.leaflet-container') as HTMLElement;
    }

    /**
     * Add a new layer to the map
     */
    addLayer(layer: ILayer) {
        if (!(layer.name in this.layerByName)) {
            if (this.visibleOnZoom(layer, this.map.getZoom())) {
                layer.leaflet.addTo(this.map);
            }

            this.layers.unshift(layer);
            // this.layers.push(layer);
            this.layerByName[layer.name] = layer;

            this.setZIndexes();

            if (layer.onClick) {
                layer.onClick(this.layerClick);
            }
        } else {
            console.error('Probeerde een laag met een al in gebruik zijnde naam toe te voegen!');
        }
    }

    /**
     * Show previously hidden layers again
     */
    showLayer(layer: ILayer) {
        layer.leaflet.addTo(this.map);
    }

    hasLayerByName(name: string): boolean {
        if (name in this.layerByName) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Hide a layer from the map only
     */
    hideLayer(layer: ILayer) {
        layer.leaflet.remove();
    }

    /**
     * Register onclick callbacks here
     */
    onClick(fun: IClickHandler) {
        this.clickHandlers.push(fun);
    }

    /**
     * Register onLayerClick callbacks here
     */
    onLayerClick(func: ILayerClickHandler) {
        this.layerClickCallbacks.push(func);
    }

    /**
     * Layers can report click events here
     */
    layerClick = (layer: ILayer, attr: any) => {
        for (const callback of this.layerClickCallbacks) {
            callback(layer, attr);
        }
    }

    checkZoom = () => {
        const zoom = this.map.getZoom();

        for (const layer of this.layers) {
            const visible = this.visibleOnZoom(layer, zoom);

            if (visible && !this.map.hasLayer(layer.leaflet)) {
                this.showLayer(layer);
            } else if (!visible && this.map.hasLayer(layer.leaflet)) {
                this.hideLayer(layer);
            }
        }
    }

    visibleOnZoom(layer: ILayer, zoom: number): boolean {
        if (layer.maxZoom) {
            if (zoom > layer.maxZoom) {
                return false;
            }
        }

        if (layer.minZoom) {
            if (zoom < layer.minZoom) {
                return false;
            }
        }

        return true;
    }

    setZIndexes() {
        if (this.layers.length > 0) {
            for (let i = 0; i < this.layers.length; i++) {
                if ((this.layers[i].leaflet as L.GridLayer).setZIndex) {
                    (this.layers[i].leaflet as L.GridLayer).setZIndex(this.layers.length - i);
                }
            }
        } else {
            console.warn('No layers to set a Z-index for');
        }
    }

    /**
     * Render a geojson source on the map.
     * @param geojson   Expected to be in the map crs
     */
    addHighlight(geojson: any, zoomTo: boolean = false) {
        if (this.highlight) {
            this.highlight.remove();
        }

        if (this.focus) {
            this.focus.remove();
        }

        const reprojected = this.project.geoTo(geojson);

        this.highlight = L.geoJSON(reprojected, {
            pointToLayer: (geojsonPoint, latlng) => {
                return L.circleMarker(latlng);
            },
        });
        this.highlight.addTo(this.map);

        if (zoomTo) {
            this.map.fitBounds(this.highlight.getBounds());
        }
    }

    hideHighlight() {
        if (this.highlight) {
            this.highlight.remove();
        }

        if (this.focus) {
            this.focus.remove();
        }
    }

    /**
     * Show previously hidden highlight again
     */
    showHighlight() {
        if (this.highlight) {
            this.highlight.addTo(this.map);
        }
    }

    /**
     * Temporary solution
     */
    addFocus(geojson: any, zoomTo: boolean = false) {
        if (this.focus) {
            this.focus.remove();
        }

        const reprojected = this.project.geoTo(geojson);

        this.focus = L.geoJSON(reprojected, {
            style: () => {
                return {
                    color: '#FF33EE',
                    weight: 5,
                    opacity: 1,
                    fill: false,
                };
            },
            pointToLayer: (geojsonPoint, latlng) => {
                return L.circleMarker(latlng);
            },
        });
        this.focus.addTo(this.map);

        if (zoomTo) {
            this.map.fitBounds(this.focus.getBounds());
        }
    }

    /**
     * Permanently remove a layer from the map
     */
    removeLayer(layer: ILayer) {
        layer.leaflet.remove();

        this.layers.splice(this.layers.indexOf(layer), 1);
        delete this.layerByName[layer.name];
    }

    /**
     * Set a basemap. They are non-interactive and always at the bottom
     */
    setBaseMap(layer: ILayer) {
        if (this.basemap) {
            this.basemap.remove();
        }

        this.basemap = layer.leaflet;

        if ((this.basemap as L.GridLayer).setZIndex) {
            (this.basemap as L.GridLayer).setZIndex(-1);
        }

        this.basemap.addTo(this.map);
    }

    /**
     * Inform the map that the user is in inspect mode
     * @todo should probably not be in this class
     */
    startInspect() {
        this.HTMLElement.style.cursor = 'help';
    }

    endInspect() {
        this.HTMLElement.style.cursor = '';
    }

    /**
     * Set the location of the pointer
     * @param latLng the location in LatLng
     */
    setPointer(latLng: L.LatLngExpression) {
        if (this.pointer) {
            this.pointer.setLatLng(latLng);
        } else {
            this.pointer = L.marker(latLng).addTo(this.map);
        }
    }

    /**
     * Fit bounds
     * @todo should accept bounds in krite CRS
     */
    fitBounds(bounds: L.LatLngBounds | undefined) {
        if (bounds) {
            this.map.fitBounds(bounds, {});
        }
    }

    /**
     * Zoom to a point
     * @param point In the CRS of the map
     */
    zoomToPoint(point: L.Point, zoom: number, marker = true) {
        const reprojected = this.project.pointTo(L.point(point.x, point.y));
        this.zoomToLatLng(reprojected, zoom, marker);
    }

    /**
     * Zoom to a point
     * @param point In LatLng (WGS84)
     */
    zoomToLatLng(point: L.LatLngExpression | L.LatLng, zoom: number, marker = true) {
        if (marker) {
            this.setPointer(point);
        }

        this.map.setView(point, zoom);
    }
}
