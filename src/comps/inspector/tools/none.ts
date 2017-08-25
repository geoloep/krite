import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class NoneTool extends Vue {
    @Prop({default: 'weawe'})
    desc: string;
}
