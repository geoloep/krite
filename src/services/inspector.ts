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

import { Krite } from '../krite';
import { ILayer } from '../types';
import Evented from '../util/evented';
import { DrawService } from './draw';

export type ToolType = 'cursor' | 'box' | 'polygon' | 'line';

export class InspectorService extends Evented {
    layer: ILayer | null;

    // Because layer click can be async from the pov of the interface we save the result of a layer click so interface
    // elements that appear after the layer-click event can still access the properties
    layerResult: {
        layer: ILayer,
        properties: any,
    } | null;

    private options = {
        highlight: true,
    };

    private krite: Krite;
    private tool: ToolType = 'cursor';

    private draw: DrawService;

    async added(krite: Krite) {
        this.krite = krite;

        await krite.promiseService('MapService');

        krite.map.on('click', this.onClick);
        krite.map.on('click-layer', this.onLayerClick);

        this.draw = await krite.promiseService<DrawService>('DrawService');
    }

    /**
     * Set the layer that has inspection focus
     * @param layer Layer instance of layer name
     */
    setLayer(layer: string | ILayer) {
        if (typeof (layer) === 'string') {
            this.layer = this.krite.map.layerByName[layer];
        } else {
            this.layer = layer;
        }

        if (this.options.highlight) {
            this.krite.map.hideHighlight();
        }

        this.emit('set-layer', this.layer);
    }

    /**
     * Deactivate inspection focus
     */
    clearLayer() {
        this.layer = null;
    }

    /**
     * Get a list of tools that are valid for the current layer
     */
    get tools() {
        const tools: ToolType[] = [];

        if (this.layer && ((this.layer.hasOperations && this.layer.intersectsPoint) || this.layer.hasOnClick)) {
            tools.push('cursor');

            if (this.layer.hasOperations && this.layer.intersects) {
                tools.push('box', 'polygon', 'line');
            }
        }

        return tools;
    }

    /**
     * Set the active tool
     * @param tool
     */
    setTool(tool: ToolType) {
        this.tool = tool;

        this.emit('set-tool', tool);
    }

    /**
     * Run the active tool, results are reported through the 'result' event
     * @param tool
     */
    async runTool(tool?: ToolType) {
        const t = tool ? tool : this.tool;

        if (t !== 'cursor' && this.draw && this.layer && this.layer.intersects) {
            switch (t) {
                case 'box':
                    this.intersect(await this.draw.rectangle());
                    break;
                case 'polygon':
                    this.intersect(await this.draw.polygon());
                    break;
                case 'line':
                    this.intersect(await this.draw.polyline());
                    break;
                default:
                    break;
            }
        }
    }

    private async intersect(shape: GeoJSON.Feature<any> | null) {
        if (shape && this.layer && this.layer.intersects) {
            const features = await this.layer.intersects(shape);

            if (this.options.highlight) {
                this.krite.map.addHighlight(features);
            }

            this.emit('result', features);
        } else {
            this.emit('result', null);
        }
    }

    private onClick = async (point: L.Point) => {
        if (this.listeners('result').length > 0 && this.layer && this.tool === 'cursor' && this.layer.hasOperations && this.layer.intersectsPoint) {
            const features = await this.layer.intersectsPoint(point);

            if (this.options.highlight) {
                this.krite.map.addHighlight(features);
            }

            this.layerResult = null;

            this.emit('result', features);
        }
    }

    private onLayerClick = (layer: ILayer, properties: any) => {
        this.layerResult = {
            layer,
            properties,
        };

        this.emit('result-layer', layer, properties);
    }
}
