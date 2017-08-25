import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class PolygonTool extends Vue {
    @Prop()
    desc: string;
}
