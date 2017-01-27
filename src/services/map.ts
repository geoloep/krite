import 'leaflet-towkt';
import * as L from 'leaflet';
import * as reproject from 'reproject';

import {ILayer, IClickHandler, ILayerClickHandler} from '../types';

export class MapService {
    HTMLElement: HTMLElement;

    layers: ILayer[] = [];
    layerByName: {
        [index: string]: ILayer
    } = {};

    map: L.Map;

    // Kaartinstellingen
    // private minZoom: number = 3;
    // private maxZoom: number = 16;

    // private initialCenter: [number, number] = [52.156, 5.389];
    // private initialZoom: number = 4;

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

    // Alleen voor het toevoegen van nieuwe lagen
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

    // Verborgen lagen weer zichtbaar maken
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

    hideLayer(layer: ILayer) {
        layer.leaflet.remove();
    };

    onClick(fun: IClickHandler) {
        this.clickHandlers.push(fun);
    };

    onLayerClick(func: ILayerClickHandler) {
        this.layerClickCallbacks.push(func);
    }

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

    // Verwacht vooralsnog geojson in de crs van de WFS
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

    showHighlight() {
        if (this.highlight) {
            this.highlight.addTo(this.map);
        }
    }

    // @todo: daadwerkelijk compleet verwijderen?
    removeLayer(layer: ILayer) {
        layer.leaflet.remove();

        this.layers.splice(this.layers.indexOf(layer), 1);
        delete this.layerByName[layer.name];
    };

    setBaseMap(url: string, options: L.TileLayerOptions) {
        if (this.basemap) {
            this.basemap.remove();
        }

        this.basemap = L.tileLayer(url, options);
        this.basemap.setZIndex(-1);
        this.basemap.addTo(this.map);
    };

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

    zoomToPoint(point: number[], zoom: number) {
        let reprojected = this.map.options.crs.projection.unproject(L.point(point[0], point[1]));
        // this.pointer.setLatLng(reprojected);
        // this.map.setView(reprojected, zoom);
        this.zoomToWgsPoint(reprojected, zoom);
    };

    zoomToWgsPoint(point: [number, number] | L.LatLng, zoom: number) {
        this.pointer.setLatLng(point);
        this.map.setView(point, zoom);
    }
};
