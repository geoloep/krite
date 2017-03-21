import * as Ractive from 'ractive';
import { RactiveApp } from '../ractiveApp';

import { IContainer } from '../../types';

export class HelloWorldApp extends RactiveApp {
    name = 'HelloWorldApp';

    constructor(readonly element?: IContainer | string, readonly who: string = 'World', name?: string) {
        super();
        super.init(element, name);
    };

    protected createRactive(element: string) {
        this.ractive = new Ractive({
            modifyArrays: true,
            el: element,
            template: require('./template.html'),
            data: {
                who: this.who,
            },
        });
    };
}
