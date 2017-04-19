import Vue from 'vue';
import { IApp, IContainer } from '../types';

/**
 * All vue apps should extend from this class
 */
export class VueApp implements IApp {
    name = 'VueApp';

    protected bootstrap: any; // Should preferably be Vue component but importing .vue gives typeof string for now

    protected vue: Vue;
    protected container: IContainer;

    insert(element: IContainer | string | undefined) {
        if (element) {
            if (typeof(element) === 'object' && element.register) {
                element.register(this);
            } else if (typeof(element) === 'string') {
                if (this.vue) {
                    this.mount(element);
                } else {
                    this.createVue(element);
                }
            }
        }
    };

    detatch() {
        console.error('Deprecated!');

        if (this.vue) {
            this.vue.$destroy();
        }
    };

    protected createVue(element: string) {
        if (this.bootstrap) {
            this.vue = new Vue({
                render: (h) => h(this.bootstrap),
            }).$mount();

            this.mount(element);
        } else {
            console.error(`No bootstrap component specified for VueApp ${this.name}`);
        }
    };

    protected mount(element: string) {
        let mountPoint = document.getElementById(element);
        if (mountPoint) {
            mountPoint.appendChild(this.vue.$el);
        } else {
            console.error(`Tried to mount ${this.name} under unexisting element ${element}`);
        }
    }
}
