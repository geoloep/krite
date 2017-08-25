import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class PointTool extends Vue {
    @Prop()
    desc: string;
}
