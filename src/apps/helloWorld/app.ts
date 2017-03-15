import * as Ractive from 'ractive';
import { RactiveApp } from '../ractiveApp';

import { IContainer } from '../../types';

export class HelloWorldApp extends RactiveApp {

    constructor(readonly element?: IContainer | string, readonly who: string = 'World') {
        super();
        super.init(element);
    };

    protected createRactive(element: string) {
        this.ractive = new Ractive({
            append: true,
            modifyArrays: true,
            el: element,
            template: require('./template.html'),
            data: {
                who: this.who,
            },
        });
    };
}