import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class App extends Vue {
    @Prop()
    who: string;
}
