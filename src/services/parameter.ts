import pool  from '../servicePool';

import { MapService } from './map';
import { SourceService } from './source';

export class ParameterService {
    parameters: {[index: string]: string} = {};

    constructor() {
        this.parseSearch();
    }

    parseSearch() {
        if (window.location.search.length > 2) {
            let params =  window.location.search.substring(1).split('&');

            for (let param of params) {
                let split = param.split('=');
                if (split.length === 2) {
                    this.parameters[decodeURI(split[0])] = decodeURI(split[1]);
                }
            }
        }
    }

    setLayers() {
        if ('source' in this.parameters && 'layer' in this.parameters) {
            pool.promiseService<SourceService>('SourceService').then((sources) => {
                pool.promiseService<MapService>('MapService').then((map) => {
                    let source = sources.get(this.parameters['source']);

                    if (source) {
                        source.getLayer(this.parameters['layer']).then((layer) => {
                            map.addLayer(layer);

                            if ('fitBounds' in this.parameters) {
                                map.fitBounds(layer.bounds);
                            }
                        });
                    }
                });
            });
        }
    }

    // setApp() {
    //     if ('app' in this.parameters) {
    //         pool.promiseService<SidebarService>('SidebarService').then((sidebar) => {
    //             sidebar.setApp(this.parameters['app']);
    //         });
    //     }
    // }
}
