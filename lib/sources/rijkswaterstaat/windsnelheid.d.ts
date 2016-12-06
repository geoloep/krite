import * as L from 'leaflet';
import { ILayer, ILayerClickHandler, TAttributes, IAttributeTypeFunc } from '../../types';
export declare class WindsnelheidLayer implements ILayer {
    readonly capabilities: any;
    group: L.FeatureGroup;
    onClickCallbacks: ILayerClickHandler[];
    private _legend;
    private attrTypes;
    private msToBft;
    constructor(capabilities: any);
    readonly hasOnClick: boolean;
    readonly name: string;
    readonly title: string;
    readonly abstract: string;
    readonly bounds: L.LatLngBounds;
    readonly preview: string;
    readonly leaflet: L.FeatureGroup;
    readonly legend: string;
    onClick(fun: ILayerClickHandler): void;
    getType(attr: string): TAttributes | IAttributeTypeFunc;
    private bftToColour(bft);
    private makeLayer();
    private clickHandler(feature);
}
