import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

// import pool from '../../servicePool';
import { AppSwitchService } from '../../../services/appSwitch';

export interface IControlAppStructure {
    [index: string]: string;
}

@Component
export default class App extends Vue {
    updateStructure = false;

    active = {
        name: '',
    };

    @Prop()
    apps: AppSwitchService;

    @Prop()
    structure: IControlAppStructure;

    mounted() {
        if (!this.structure) {
            this.makeStructure();
            this.updateStructure = true;
        }

        this.apps.registerOnChange(this.onChange);
    }

    onChange = (): void => {
        if (this.updateStructure) {
            this.makeStructure();
        }

        let newName = this.apps.getActiveName();

        if (newName) {
            this.active.name = newName;
        }
    }

    activate(name: string) {
        this.apps.setApp(name);
    }

    makeStructure() {
        let structure: IControlAppStructure = {};
        let apps = this.apps.getApps();

        for (let app of Object.keys(apps)) {
            structure[app] = app;
        }

        this.structure = structure;
    }

};
