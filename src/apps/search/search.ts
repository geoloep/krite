import * as Ractive from 'ractive';
import { RactiveApp } from '../ractiveApp';

import pool from '../../servicePool';
import { MapService } from '../../services/map';
import { GeocodeService } from '../../services/geocode';

import { IContainer } from '../../types';

export class SearchApp extends RactiveApp {
    private map: MapService = pool.getService<MapService>('MapService');
    private geocode: GeocodeService = pool.getService<GeocodeService>('GeocodeService');

    private searchTimeOut: number;

    private timeOutLength = 500;

    private diepteNaarZoom: {[index: string]: number} = {
        'Building': 12,
        'Street': 12,
        'MunicipalitySubdivision': 8,
        'MunicipalityCapital': 8,
        'Municipality': 8,
        'CountrySubdivision': 5,
    };

    private depthOrder = [
        'Building',
        'MunicipalitySubdivision',
        'Street',
        'Municipality',
        'CountrySubdivision',
    ];

    constructor(element?: IContainer | string) {
        super();
        super.init(element);
    };

    protected createRactive(element: string) {
        // let this = this;

        this.ractive = new Ractive({
            append: true,
            data: {
                currentDepth: 'Building',
                currentNum: 0,
                dropdown: false,
                results: {},
                searchString: '',
            },
            el: element,
            modifyArrays: true,
            template: require('./template.html'),
        });

        this.ractive.on('input-focus', (e) => {
            this.ractive.set('dropdown', true);
        });

        this.ractive.on('input-blur', (e) => {
            this.ractive.set('dropdown', false);
        });

        this.ractive.observe('searchString', (n, o, k) => {
            if (this.searchTimeOut) {
                window.clearTimeout(this.searchTimeOut);
            }

            if (n && n !== '') {
                this.searchTimeOut = window.setTimeout(this.search, this.timeOutLength, n);
            }
        });

        this.ractive.on('searchClick', (e) => {
            this.searchClick(e.get());
        });

        this.ractive.on('input-keyup', (e) => {
            if (e.original.key === 'ArrowDown') {
                e.original.preventDefault();
                this.selectDown();
            } else if (e.original.key === 'ArrowUp') {
                e.original.preventDefault();
                this.selectUp();
            } else if (e.original.key === 'Enter') {
                // @todo: dropdown wel of niet sluiten?
                e.original.preventDefault();
                let context = this.ractive.get('results.' + this.ractive.get('currentDepth') + '.' + this.ractive.get('currentNum'));
                if (context) {
                    this.searchClick(context);
                }
            } else if (e.original.key === 'Escape') {
                this.ractive.toggle('dropdown');
            }
        });

    };

    private search = (searchString: string) => {
        this.geocode.search(searchString).then(this.searchSuccess).catch(this.searchFail);
    };

    private searchClick(context: any) {
        this.map.zoomToPoint(context.Point.pos, this.diepteNaarZoom[(context.Depth as string)]);
    };

    private searchSuccess = (data: any) => {
        this.ractive.set('results', data);
        this.selectReset();
    };

    private searchFail = () => {
        console.error('Fout bij zoeken');
    };

    private selectDown = () => {
        let nextNum = this.ractive.get('currentNum') + 1;
        let currentDepth = this.ractive.get('currentDepth');

        if (this.ractive.get('results.' + currentDepth + '.' + nextNum)) {
            // Volgende nummer bestaat binnen de huidige diepte
            this.ractive.set('currentNum', nextNum);
        } else {
            // Volgende dieptes proberen
            if (this.depthOrder.indexOf(currentDepth) + 1) {
                for (let i = this.depthOrder.indexOf(currentDepth) + 1; i < this.depthOrder.length; i++) {
                    let nextDepth = this.depthOrder[i];

                    if (this.ractive.get('results.' + nextDepth)) {
                        this.ractive.set('currentDepth', nextDepth);
                        this.ractive.set('currentNum', 0);
                        break;
                    }
                }
            }
        }
    };

    private selectReset() {
        this.ractive.set('currentDepth', 0);
        for (let i = 0; i < this.depthOrder.length; i++) {
            if (this.ractive.get('results.' + this.depthOrder[i])) {
                this.ractive.set('currentDepth', this.depthOrder[i]);
                break;
            }
        }
    };

    private selectUp = () => {
        let nextNum = this.ractive.get('currentNum') - 1;
        let currentDepth = this.ractive.get('currentDepth');

        if (this.ractive.get('results.' + currentDepth + '.' + nextNum)) {
            // Vorige nummer bestaat binnen de huidige diepte
            this.ractive.set('currentNum', nextNum);
        } else {
            // Vorige dieptes proberen
            if (this.depthOrder.indexOf(currentDepth) - 1) {
                for (let i = this.depthOrder.indexOf(currentDepth) - 1; i >= 0; i--) {
                    let nextDepth = this.depthOrder[i];
                    let results = this.ractive.get('results.' + nextDepth);

                    if (results) {
                        this.ractive.set('currentDepth', nextDepth);
                        this.ractive.set('currentNum', results.length - 1);
                        break;
                    }
                }
            }
        }
    }
}
