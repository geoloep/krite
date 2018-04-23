import Vue, { VNodeData } from 'vue';
import { IApp, IContainer } from '../types';

import { ComponentOptions } from 'vue/types/options';
import { VueConstructor } from 'vue/types/vue';

/**
 * All vue based apps should extend from this class
 */
export class VueApp implements IApp {
    name = 'VueApp';

    protected props: any = {
    };

    protected data: VNodeData = {
    };

    protected vue: Vue;
    protected container: IContainer;

    constructor(protected bootstrap: VueConstructor, options?: VNodeData, name?: string) {
        if (options) {
            this.data = options;
        }

        if (name) {
            this.name = name;
        }
    }

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
    }

    detatch() {
        if (this.vue) {
            const parent = this.vue.$el.parentElement;
            this.vue.$props.inserted = false;

            if (parent) {
                parent.removeChild(this.vue.$el);
            }
        }
    }

    on(event: string | string[], callback: any) {
        this.vue.$on(event, callback);
    }

    protected createVue() {
        const options: ComponentOptions<Vue> = {
            props: ['isapp', 'inserted'],
            render: (h) => h(this.bootstrap, this.data),
        };

        if (this.bootstrap) {
            this.vue = new Vue(options).$mount();

            this.vue.$props.inserted = false;
            this.vue.$props.isapp = true;

        } else {
            throw new Error(`No bootstrap component specified for VueApp ${this.name}`);
        }
    }

    protected mount(element: string) {
        const mountPoint = document.getElementById(element);
        if (mountPoint) {
            mountPoint.appendChild(this.vue.$el);

            this.vue.$props.inserted = true;
        } else {
            throw new Error(`Tried to mount ${this.name} under unexisting element ${element}`);
        }
    }
}
