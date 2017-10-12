/*
Copyright 2017 Geoloep

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

import { ILayer } from '../types';

export class InspectorService {
    private _layer: ILayer;

    onChangeCallBacks: Array<(layer: ILayer) => void> = [];

    get name() {
        if (this.layer && this.layer.name) {
            return this.layer.name;
        } else {
            return '';
        }
    }

    get layer() {
        return this._layer;
    }

    set layer(layer: ILayer) {
        this._layer = layer;
        this.onChangeHandler();
    }

    onChange(callback: (layer: ILayer) => void) {
        this.onChangeCallBacks.push(callback);
    }

    private onChangeHandler() {
        for (let callback of this.onChangeCallBacks) {
            callback(this.layer);
        }
    }
};
