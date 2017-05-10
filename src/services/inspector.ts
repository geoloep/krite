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
