import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class PolylineTool extends Vue {
    @Prop()
    desc: string;
}
