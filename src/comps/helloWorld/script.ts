import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

// import pool from '../../servicePool';
import { AppSwitchService } from '../../services/appSwitch';

@Component
export default class App extends Vue {
    @Prop
    who: String;
};
