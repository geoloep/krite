/*
Copyright 2018 Geoloep

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import * as L from 'leaflet';

// import pool from '../servicePool';
import { ProjectService } from './project';

import { Krite } from '../krite';
import { IClickHandler, ILayer, ILayerClickHandler } from '../types';

export interface ICustomMapOptions {
    checkZoom?: boolean;
    defaultMarker?: L.Icon | L.Icon.Default;
    highlightStyle?: L.StyleFunction;
    focusStyle?: L.StyleFunction;
}

interface IMapOptions {
    checkZoom: boolean;
    defaultMarker: L.Icon | L.Icon.Default;
    highlightStyle: L.StyleFunction;
    focusStyle: L.StyleFunction;
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
        defaultMarker: new L.Icon.Default(),
        highlightStyle: () => {
            return {};
        },
        focusStyle: () => {
            return {
                color: '#FF33EE',
                weight: 5,
                opacity: 1,
                fill: false,
            };
        },
    };

    // Lagen bijhouden
    private basemap: ILayer;
    private highlight: L.GeoJSON;
    private focus: L.GeoJSON;
    private pointer: L.Marker;

    private krite: Krite;
    private project: ProjectService;

    private clickHandlers: IClickHandler[] = [];
    private layerClickCallbacks: ILayerClickHandler[] = [];

    private container: HTMLElement;

    constructor(container?: HTMLElement | string, readonly customOptions?: L.MapOptions, mapOptions?: ICustomMapOptions) {
        if (container) {
            if (typeof container === 'string') {
                const el = document.getElementById(container);

                if (el === null) {
                    throw new Error(`Mounting point ${container} not found`);
                } else {
                    this.container = el;
                }
            } else {
                this.container = container;
            }
        } else {
            container = this.container = document.createElement('div');
            container.style.cssText = ('width: 100%; height: 100%');
        }

        this.map = L.map(container,
            Object.assign(this.defaultLeafletOptions, this.customOptions),
        );

        this.mapOptions = Object.assign(this.mapOptions, mapOptions);

        if (this.mapOptions.checkZoom) {
            this.map.on('zoomend', () => {
                this.checkZoom();
            });
        }

        // @todo: is dit element gegarandeerd aanwezig op dit moment?
        this.HTMLElement = document.querySelector('.leaflet-container') as HTMLElement;
    }

    added(krite: Krite) {
        this.krite = krite;
        this.project = krite.getService<ProjectService>('ProjectService');

        this.map.on('click', (e: L.MouseEvent) => {
            // latlng does not exist on KeyBoardevents. Enter may fire click'
            if (e.latlng) {
                for (const func of this.clickHandlers) {
                    func(this.project.pointFrom(e.latlng));
                }
            }
        });
    }

    /**
     * Attatch the leaflet map to the given DOM element
     * @param parent target parent node
     * @param center recenter map after mounting
     */
    attatch(parent: HTMLElement, center?: boolean) {
        this.detatch();

        parent.appendChild(this.container);

        this.map.invalidateSize(false);

        if (center && this.customOptions && this.customOptions.zoom) {
            this.map.setView(this.customOptions.center as L.LatLng, this.customOptions.zoom, {
                animate: false,
            });
        }
    }

    /**
     * Detatch the map from it's current parent element
     */
    detatch() {
        if (this.container.parentElement !== null) {
            this.container.parentElement.removeChild(this.container);
        }
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

    cancelOnClick(fun: IClickHandler) {
        if (this.clickHandlers.indexOf(fun) !== -1) {
            this.clickHandlers.splice(this.clickHandlers.indexOf(fun), 1);
        }
    }

    /**
     * Register onLayerClick callbacks here
     */
    onLayerClick(func: ILayerClickHandler) {
        this.layerClickCallbacks.push(func);
    }

    cancelOnLayerClick(func: ILayerClickHandler) {
        if (this.layerClickCallbacks.indexOf(func) !== -1) {
            this.layerClickCallbacks.splice(this.layerClickCallbacks.indexOf(func), 1);
        }
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

        for (const layer of this.layers.concat(this.basemap ? [this.basemap] : [])) {
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
     * @param fitBounds set to true to zoom to the highlight, pass FitBoundsOptions to custimize behaviour
     */
    addHighlight(geojson: any, fitBounds?: L.FitBoundsOptions | true) {
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
            style: this.mapOptions.highlightStyle,
        });
        this.highlight.addTo(this.map);

        if (fitBounds) {
            this.map.fitBounds(this.highlight.getBounds(), typeof (fitBounds) === 'boolean' ? undefined : fitBounds);
        }

        return this.highlight;
    }

    hideHighlight() {
        if (this.highlight) {
            this.highlight.remove();
        }

        this.hideFocus();
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
            style: this.mapOptions.focusStyle,
            pointToLayer: (geojsonPoint, latlng) => {
                return L.circleMarker(latlng);
            },
        });
        this.focus.addTo(this.map);

        if (zoomTo) {
            this.map.fitBounds(this.focus.getBounds());
        }
    }

    hideFocus() {
        if (this.focus) {
            this.focus.remove();
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
            this.basemap.leaflet.remove();
        }

        this.basemap = layer;

        if ((this.basemap.leaflet as L.GridLayer).setZIndex) {
            (this.basemap.leaflet as L.GridLayer).setZIndex(-1);
        }

        this.basemap.leaflet.addTo(this.map);
    }

    /**
     * Disable the background layer
     */
    hideBaseMap() {
        if (this.basemap) {
            this.basemap.leaflet.remove();
        }
    }

    /**
     * Make the basemap visible again
     */
    showBaseMap() {
        if (this.basemap) {
            this.basemap.leaflet.addTo(this.map);
        }
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
            this.pointer = L.marker(latLng, {
                icon: this.mapOptions.defaultMarker,
            }).addTo(this.map);
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
