<template>
    <div class="NoneTool">
        <i class="fa fa-ban" aria-hidden="true"></i>&nbsp;{{desc}}
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class NoneTool extends Vue {
    @Prop({default: 'weawe'})
    desc: string;
}
</script>
