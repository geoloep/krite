import Vue from 'vue';
import { IApp, IContainer } from '../types';

/**
 * All vue based apps should extend from this class
 */
export class VueApp implements IApp {
    name = 'VueApp';

    /**
     * The component to be loaded in the root of this Vue App
     */
    protected bootstrap: any; // Should preferably be Vue component but importing .vue gives typeof string for now

    /**
     * Props to be passed to the bootstrap component
     */
    protected props: any = {
    };

    protected vue: Vue;
    protected container: IContainer;

    insert(element: IContainer | string | undefined) {
        if (!this.vue) {
            this.createVue();
        }

        if (element) {
            if (typeof(element) === 'object' && element.register) {
                element.register(this);
            } else if (typeof(element) === 'string') {
                this.mount(element);
            }
        }
    };

    detatch() {
        if (this.vue) {
            let parent = this.vue.$el.parentElement;
            this.vue.$props.inserted = false;

            if (parent) {
                parent.removeChild(this.vue.$el);
            }
        }
    };

    protected createVue() {
        if (this.bootstrap) {
            this.vue = new Vue({
                props: ['isapp', 'inserted'],
                render: (h) => h(this.bootstrap, {
                    props: this.props,
                }),
            }).$mount();

            this.vue.$props.inserted = false;
            this.vue.$props.isapp = true;

        } else {
            console.error(`No bootstrap component specified for VueApp ${this.name}`);
        }
    };

    protected mount(element: string) {
        let mountPoint = document.getElementById(element);
        if (mountPoint) {
            mountPoint.appendChild(this.vue.$el);

            this.vue.$props.inserted = true;
        } else {
            console.error(`Tried to mount ${this.name} under unexisting element ${element}`);
        }
    }
}
