/*
Copyright 2022 Geoloep

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

import {GeoserverWFSLayer} from './wfs';
import {GeoserverWMSLayer} from './wms';
import {IOWSLayeroptions, OWSSource} from "../ows/source";

export class GeoserverSource extends OWSSource {
    protected createWMSLayer(wmsNode: Node, wfsNode?: Node, options?: IOWSLayeroptions) {
        let wfsLayer: GeoserverWFSLayer | undefined = undefined;

        if (wfsNode) {
            wfsLayer = this.createWFSLayer(wfsNode)
        }

        const layer = new GeoserverWMSLayer(
            this.options.wms,
            wmsNode,
            options,
            wfsLayer,
        );

        layer.added(this.krite);

        return layer;
    }

    protected createWFSLayer(wfsNode: Node) {
        const layer = new GeoserverWFSLayer(this.baseUrl, wfsNode);
        layer.added(this.krite);
        return layer;
    }

}
