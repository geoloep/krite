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

import { CircleMarker, FitBoundsOptions, GeoJSON, GridLayer, Icon, LatLng, LatLngBounds, LatLngExpression, Map, MapOptions, Marker, Point, StyleFunction, Layer } from 'leaflet';

import Evented from '../util/evented';

import { Krite } from '../krite';
import { ILayer, ILayerEvented } from '../types';

export interface ICustomMapOptions {
    checkZoom?: boolean;
    container?: string | HTMLElement;
    defaultMarker?: Icon | Icon.Default;
    highlightStyle?: StyleFunction;
    focusStyle?: StyleFunction;
    leaflet?: MapOptions;
}

interface IMapOptions {
    checkZoom: boolean;
    defaultMarker: Icon | Icon.Default;
    highlightStyle: StyleFunction;
    focusStyle: StyleFunction;
    leaflet: MapOptions;
}

/**
 * This service controls the leaflet map.
 */
export class MapService extends Evented {
    layers: ILayer[] = [];
    layerByName: {
        [index: string]: ILayer,
    } = {};

    leaflet: Map;

    defaultLeafletOptions: MapOptions = {
        // crs: rd,
    };

    private mapOptions: IMapOptions = {
        checkZoom: false,
        defaultMarker: new Icon.Default(),
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
        leaflet: {},
    };

    // private customOptions: ICustomMapOptions;

    // Lagen bijhouden
    private basemap: ILayer;
    private highlight: GeoJSON;
    private focus: GeoJSON;
    private pointer: Marker;

    private krite: Krite;
    // private project: ProjectService;

    private container: HTMLElement;

    get layerNames() {
        const names = [];

        for (const layer of this.layers) {
            names.push(layer.name);
        }

        return names;
    }

    constructor(private customOptions?: ICustomMapOptions) {
        super();

        // let container: HTMLElement;

        // this.mapOptions = Object.assign(this.mapOptions, options);

        // if (options.container) {
        //     if (typeof options.container === 'string') {
        //         const el = document.getElementById(options.container);

        //         if (el === null) {
        //             throw new Error(`Mounting point ${options.container} not found`);
        //         } else {
        //             container = this.container = el;
        //         }
        //     } else {
        //         container = this.container = options.container;
        //     }
        // } else {
        //     container = this.container = document.createElement('div');
        //     container.style.cssText = ('width: 100%; height: 100%');
        // }

        // const leaflet = this.leaflet = new Map(container, options.leaflet);

        // if (this.mapOptions.checkZoom) {
        //     leaflet.on('zoomend', () => {
        //         this.checkZoom();
        //     });
        // }
    }

    added(krite: Krite) {
        if (this.krite) {
            throw new Error('MapService cannot be reassigned to a new krite instance')
        }

        this.krite = krite;

        // Find the container to put the map in
        const container = this.findContainer(this.customOptions ? this.customOptions.container : '');

        const options = this.mapOptions = Object.assign(this.mapOptions, this.customOptions);

        // Set leaflet to use the crs of the krite instance
        options.leaflet.crs = krite.crs.crs;

        const leaflet = this.leaflet = new Map(container, options.leaflet);

        if (this.mapOptions.checkZoom) {
            leaflet.on('zoomend', () => {
                this.checkZoom();
            });
        }

        this.leaflet.on('click', (e) => {
            // latlng does not exist on KeyBoardevents. Enter may fire click'
            // @todo fix use of any
            if ((<any>e).latlng) {
                this.emit('click', this.krite.crs.pointFrom((<any>e).latlng));
            }
        });
    }

    /**
     * Attach the leaflet map to the given DOM element
     * @param parent target parent node
     * @param center recenter map after mounting
     */
    attach(parent: HTMLElement, center?: boolean) {
        this.detach();

        parent.appendChild(this.container);

        this.leaflet.invalidateSize(false);

        if (center && this.mapOptions.leaflet.center && this.mapOptions.leaflet.zoom) {
            this.leaflet.setView(this.mapOptions.leaflet.center as LatLng, this.mapOptions.leaflet.zoom, {
                animate: false,
            });
        }
    }

    /**
     * Detach the map from it's current parent element
     */
    detach() {
        if (this.container.parentElement !== null) {
            this.container.parentElement.removeChild(this.container);
        }
    }

    /**
     * Add a new layer to the map
     */
    addLayer(layer: ILayer | ILayerEvented) {
        if (!(layer.name in this.layerByName)) {
            if (layer.added) {
                layer.added(this.krite);
            }

            if (this.visibleOnZoom(layer, this.leaflet.getZoom())) {
                layer.leaflet.addTo(this.leaflet);
            }

            this.layers.unshift(layer);
            this.layerByName[layer.name] = layer;

            this.setZIndexes();

            if ((<ILayerEvented>layer).hasEvents) {
                (<ILayerEvented>layer).on('click', this.layerClick);
            }

            this.emit('layer-add', layer);
        } else {
            throw new Error('Tried adding a layer with the same name twice');
        }
    }

    /**
     * Show previously hidden layers again
     */
    showLayer(layer: ILayer) {
        layer.leaflet.addTo(this.leaflet);

        this.emit('layer-show', layer);
    }

    hasLayerByName(name: string): boolean {
        return name in this.layerByName;
    }

    /**
     * Hide a layer from the map only
     */
    hideLayer(layer: ILayer) {
        layer.leaflet.remove();

        this.emit('layer-hide', layer);
    }

    /**
     * Layers can report click events here
     */
    layerClick = (layer: ILayer, attr: any) => {
        // for (const callback of this.layerClickCallbacks) {
        //     callback(layer, attr);
        // }
        this.emit('click-layer', layer, attr);
    }

    checkZoom = () => {
        const zoom = this.leaflet.getZoom();

        for (const layer of this.layers.concat(this.basemap ? [this.basemap] : [])) {
            const visible = this.visibleOnZoom(layer, zoom);

            if (visible && !this.leaflet.hasLayer(layer.leaflet)) {
                this.showLayer(layer);
            } else if (!visible && this.leaflet.hasLayer(layer.leaflet)) {
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

    hasGridLayer(layer: ILayer<Layer> | ILayer<GridLayer>): layer is ILayer<GridLayer> {
        return Boolean((layer as ILayer<GridLayer>).leaflet.setZIndex);
    }

    setZIndexes() {
        let layer: ILayer;

        for (const i of Array(this.layers.length).keys()) {
            layer = this.layers[i];
            if (this.hasGridLayer(layer)) {
                if (typeof layer.zIndex === 'number') {
                    layer.leaflet.setZIndex(layer.zIndex);
                } else {
                    layer.leaflet.setZIndex(this.layers.length - i);
                }
            }
        }
    }

    /**
     * Render a geojson source on the map.
     * @param geojson   Expected to be in the map crs
     * @param fitBounds set to true to zoom to the highlight, pass FitBoundsOptions to customize behaviour
     */
    addHighlight(geojson: any, fitBounds?: FitBoundsOptions | true) {
        if (this.highlight) {
            this.highlight.remove();
        }

        if (this.focus) {
            this.focus.remove();
        }

        const reprojected = this.krite.crs.geoTo(geojson);

        this.highlight = new GeoJSON(reprojected, {
            pointToLayer: (geojsonPoint, latlng) => {
                return new CircleMarker(latlng);
            },
            style: this.mapOptions.highlightStyle,
        });
        this.highlight.addTo(this.leaflet);

        if (fitBounds) {
            this.leaflet.fitBounds(this.highlight.getBounds(), typeof (fitBounds) === 'boolean' ? undefined : fitBounds);
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
            this.highlight.addTo(this.leaflet);
        }
    }

    /**
     * Temporary solution
     */
    addFocus(geojson: any, zoomTo: boolean = false) {
        if (this.focus) {
            this.focus.remove();
        }

        const reprojected = this.krite.crs.geoTo(geojson);

        this.focus = new GeoJSON(reprojected, {
            style: this.mapOptions.focusStyle,
            pointToLayer: (geojsonPoint, latlng) => {
                return new CircleMarker(latlng);
            },
        });
        this.focus.addTo(this.leaflet);

        if (zoomTo) {
            this.leaflet.fitBounds(this.focus.getBounds());
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
        if (this.leaflet.hasLayer(layer.leaflet)) {
            layer.leaflet.remove();
        }

        this.layers.splice(this.layers.indexOf(layer), 1);
        delete this.layerByName[layer.name];

        this.emit('layer-remove', layer);
    }

    /**
     * Set a basemap. They are non-interactive and always at the bottom
     */
    setBaseMap(layer: ILayer) {
        if (this.basemap) {
            this.basemap.leaflet.remove();
        }

        if (layer.added) {
            layer.added(this.krite);
        }

        this.basemap = layer;

        if ((this.basemap.leaflet as GridLayer | any).setZIndex) {
            (this.basemap.leaflet as GridLayer).setZIndex(-1);
        }

        if (this.visibleOnZoom(layer, this.leaflet.getZoom())) {
            this.basemap.leaflet.addTo(this.leaflet);
        }

        this.emit('basemap-set', layer);
    }

    /**
     * Disable the background layer
     */
    hideBaseMap() {
        if (this.basemap) {
            this.basemap.leaflet.remove();
        }

        this.emit('basemap-hide');
    }

    /**
     * Make the basemap visible again
     */
    showBaseMap() {
        if (this.basemap) {
            this.basemap.leaflet.addTo(this.leaflet);
        }

        this.emit('basemap-show');
    }

    /**
     * Inform the map that the user is in inspect mode
     * @todo should probably not be in this class
     */
    startInspect() {
        this.container.style.cursor = 'help';
    }

    endInspect() {
        this.container.style.cursor = '';
    }

    /**
     * Set the location of the pointer
     * @param latLng the location in LatLng
     */
    setPointer(latLng: LatLngExpression) {
        if (this.pointer) {
            this.pointer.setLatLng(latLng);
        } else {
            this.pointer = new Marker(latLng, {
                icon: this.mapOptions.defaultMarker,
            }).addTo(this.leaflet);
        }
    }

    /**
     * Fit bounds
     * @todo should accept bounds in krite CRS
     */
    fitBounds(bounds: LatLngBounds | undefined) {
        if (bounds) {
            this.leaflet.fitBounds(bounds, {});
        }
    }

    /**
     * Zoom to a point
     * @param point In the CRS of the map
     */
    zoomToPoint(point: Point, zoom: number, marker = true) {
        const reprojected = this.krite.crs.pointTo(new Point(point.x, point.y));
        this.zoomToLatLng(reprojected, zoom, marker);
    }

    /**
     * Zoom to a point
     * @param point In LatLng (WGS84)
     */
    zoomToLatLng(point: LatLngExpression | LatLng, zoom: number, marker = true) {
        if (marker) {
            this.setPointer(point);
        }

        this.leaflet.setView(point, zoom);
    }

    private findContainer(option?: string | HTMLElement) {
        let container: HTMLElement;

        if (option) {
            if (typeof option === 'string') {
                const el = document.getElementById(option);

                if (el === null) {
                    throw new Error(`Mounting point ${option} not found`);
                } else {
                    container = this.container = el;
                }
            } else {
                container = option;
            }
        } else {
            container = this.container = document.createElement('div');
            container.style.cssText = ('width: 100%; height: 100%')
        }

        return container;
    }
}
