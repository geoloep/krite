import 'leaflet-towkt';
import * as L from 'leaflet';
import * as reproject from 'reproject';

import {ILayer, IClickHandler, ILayerClickHandler} from '../types';

/**
 * This service controls the leaflet map.
 */
export class MapService {
    HTMLElement: HTMLElement;

    layers: ILayer[] = [];
    layerByName: {
        [index: string]: ILayer
    } = {};

    map: L.Map;

    defaultOptions: L.MapOptions = {
        // crs: rd,
    };

    // Lagen bijhouden
    private basemap: L.TileLayer;
    private highlight: L.GeoJSON;
    private pointer: L.Marker;

    private clickHandlers: IClickHandler[] = [];
    private layerClickCallbacks: ILayerClickHandler[] = [];

    constructor(readonly element: string, readonly customOptions?: L.MapOptions) {
        this.map = L.map((this.element as any),
            Object.assign(this.defaultOptions, this.customOptions)
        );

        this.pointer = L.marker([0, 0]).addTo(this.map);

        this.map.on('click', (e: L.MouseEvent) => {
            for (let func of this.clickHandlers) {
                func(this.map.options.crs.project(e.latlng));
            }
        });

        // @todo: is dit element gegarandeerd aanwezig op dit moment?
        this.HTMLElement = document.querySelector('.leaflet-container') as HTMLElement;
    };

    /**
     * Add a new layer to the map
     */
    addLayer(layer: ILayer) {
        if (!(layer.name in this.layerByName)) {
            layer.leaflet.addTo(this.map);

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
    };

    /**
     * Show previously hidden layers again
     */
    showLayer(layer: ILayer) {
        let leaflet = layer.leaflet;
        leaflet.addTo(this.map);
    };

    hasLayerByName(name: string): boolean {
        if (name in this.layers) {
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
    };

    /**
     * Register onclick callbacks here
     */
    onClick(fun: IClickHandler) {
        this.clickHandlers.push(fun);
    };

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
        for (let callback of this.layerClickCallbacks) {
            callback(layer, attr);
        }
    };

    setZIndexes() {
        if (this.layers.length > 0) {
            for (let i = 0; i < this.layers.length; i++) {
                // this.layers[i].leaflet.set
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

        let reprojected = reproject.toWgs84(geojson, this.map.options.crs.projection.proj4def);

        this.highlight = L.geoJSON(reprojected);
        this.highlight.addTo(this.map);

        if (zoomTo) {
            this.map.fitBounds(this.highlight.getBounds());
        }
    };

    hideHighlight() {
        if (this.highlight) {
            this.highlight.remove();
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
     * Permanently remove a layer from the map
     */
    removeLayer(layer: ILayer) {
        layer.leaflet.remove();

        this.layers.splice(this.layers.indexOf(layer), 1);
        delete this.layerByName[layer.name];
    };

    /**
     * Set the basemap. Only L.TileLayers are supported at the moment
     */
    setBaseMap(url: string, options: L.TileLayerOptions) {
        if (this.basemap) {
            this.basemap.remove();
        }

        this.basemap = L.tileLayer(url, options);
        this.basemap.setZIndex(-1);
        this.basemap.addTo(this.map);
    };

    /**
     * Inform the map that the user is in inspect mode
     */
    startInspect() {
        this.HTMLElement.style.cursor = 'help';
    }

    endInspect() {
        this.HTMLElement.style.cursor = '';
    }

    fitBounds(bounds: L.LatLngBounds | undefined) {
        if (bounds) {
            this.map.fitBounds(bounds, {});
        }
    }

    /**
     * Zoom to a point
     * @param point In the CRS of the map
     */
    zoomToPoint(point: number[], zoom: number) {
        let reprojected = this.map.options.crs.projection.unproject(L.point(point[0], point[1]));
        // this.pointer.setLatLng(reprojected);
        // this.map.setView(reprojected, zoom);
        this.zoomToWgsPoint(reprojected, zoom);
    };

    /**
     * Zoom to a point
     * @param point In LatLng (WGS84)
     */
    zoomToWgsPoint(point: [number, number] | L.LatLng, zoom: number) {
        this.pointer.setLatLng(point);
        this.map.setView(point, zoom);
    }
};
