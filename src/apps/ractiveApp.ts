import { IContainer } from '../types';

/**
 * All apps should extend from this class
 */
export class RactiveApp {
    name = 'RactiveApp';

    protected ractive: Ractive.Ractive;
    protected container: IContainer;

    // @todo: init en insert weer samenvoegen?
    init(element?: IContainer | string) {
        if (element) {
            if (typeof(element) === 'object' && element.register) {
                element.register(this);
            } else if (typeof(element) === 'string') {
                this.insert(element);
            }
        }
    }

    insert(element: IContainer | string | undefined) {
        if (element) {
            if (typeof(element) === 'object' && element.register) {
                this.init(element);
            } else if (typeof(element) === 'string') {
                if (this.ractive) {
                    this.ractive.insert(element);
                } else {
                    this.createRactive(element);
                }
            }
        }
    };

    detatch() {
        if (this.ractive) {
            this.ractive.detach();
        }
    };

    protected createRactive(element: string) {
        console.error('createRactive not implemented for RactiveApp');
    };
}
