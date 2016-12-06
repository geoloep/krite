import * as Ractive from 'ractive';
import { RactiveApp } from '../ractiveApp';

import pool from '../../servicePool';
import { MapService } from '../../services/map';
import { SourceService } from '../../services/source';
import { SidebarService } from '../../services/sidebar';

import { IContainer } from '../../types';

export class LayerBrowserApp extends RactiveApp {
    private selectedSource: string = '';
    private service = pool.getService<SourceService>('SourceService');
    private map = pool.getService<MapService>('MapService');
    private sidebar = pool.tryService<SidebarService>('SidebarService');

    private selectedLayer = {
        abstract: 'Kies een databron en vervolgens een kaartlaag om informatie aan de kaart toe te voegen.',
        preview: '',
        name: '',
        title: 'Selecteer een laag',
    };

    constructor(element?: IContainer | string) {
        super();
        super.init(element);
    }

    protected createRactive(element: string) {
        this.ractive = new Ractive({
            // magic: true,
            el: element,
            modifyArrays: true,
            template: require('./template.html'),
            data: {
                layerFilter: '',
                layerList: [],

                sourceLoading: false,
                layerLoading: false,
                layerAddable: false,

                sourceList: this.service.sourceList,

                selectedLayer: this.selectedLayer,

                selectedSource: this.selectedSource,
                filteredLayerList: function (layerList: string[], filter: string) {
                    let listOut: any[] = [];

                    for (let layer of layerList) {
                        if (layer.indexOf(filter) >= 0) {
                            listOut.push(layer);
                        }
                    }

                    return listOut;
                },
            },
        });

        this.ractive.observe('selectedSource', (newValue) => {
            if (newValue && newValue !== '') {
                this.ractive.set({
                    loading: true,
                    selectedLayer: this.selectedLayer,
                    layerAddable: false,
                });

                this.service.sources[newValue].getLayerNames().then(
                    (layerList: string[]) => {
                        this.ractive.set({
                            layerList: layerList,
                            loading: false,
                        });
                    }
                );
            } else {
                this.ractive.set({
                    layerList: [],
                    loading: false,
                });
            }
        });

        this.ractive.on('selectLayer', (e: any) => {
            this.ractive.set('layerLoading', true);

            this.service.sources[this.ractive.get('selectedSource')].getLayer(e.get())
            .then((layer) => {
                this.ractive.set({
                    layerLoading: false,
                    layerAddable: true,
                    selectedLayer: layer,
                });
            })
            .catch((reason) => {
                console.error(reason);
            });
        });

        this.ractive.on('addLayer', (e) => {
            this.map.addLayer(this.ractive.get('selectedLayer'));

            if (this.sidebar) {
                this.sidebar.setApp('LegendApp');
            }
        });

    }
}
