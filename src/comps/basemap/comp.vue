<template>
    <div class="basemapComponent">
        <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title">Basiskaart kiezen</h4>
        </div>
        <div class="modal-body">
            <template v-for="basemap in basemaps">
                <div @click="setBasemap(basemap)" style="width: 100%; height: 100px; cursor: pointer;" :style="{'background-image': 'url(' + basemap.preview + ')'}"></div>
                <br>
            </template>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Sluiten</button>
        </div>
    </div>
</template>

<script src="./script.js"></script>