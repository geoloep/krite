import * as Ractive from 'ractive';
import { RactiveApp } from '../ractiveApp';

import { IContainer } from '../../types';

export class IntroApp extends RactiveApp {
    name = 'IntroApp';

    constructor(readonly element?: IContainer | string) {
        super();
        super.init(element);
    };

    protected createRactive(element: string) {
        this.ractive = new Ractive({
            append: true,
            modifyArrays: true,
            el: element,
            template: require('./template.html'),
        });
    };
}
