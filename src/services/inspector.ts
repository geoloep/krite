import { ILayer } from '../types';

export class InspectorService {
    layer: ILayer;

    get name() {
        if (this.layer && this.layer.name) {
            return this.layer.name;
        } else {
            return '';
        }
    }
};
