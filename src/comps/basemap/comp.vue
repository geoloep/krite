<template>
    <div class="basemapComponent">
        <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title">Basiskaart kiezen</h4>
        </div>
        <div class="modal-body">
            <div v-for="basemap in basemaps">
                <div v-html="basemap.preview" class="basemap text-center" @click="setBasemap(basemap)"></div>
                <br>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Sluiten</button>
        </div>
    </div>
</template>

<style scoped>
</style>

<script src="./script.js"></script>