<template>
    <div class="basemapComponent">
        <div v-for="(basemap, key) in basemaps" :key="key">
            <div class="basemap" v-html="basemap.preview" @click="setBasemap(basemap)"></div>
            <br>
        </div>
    </div>
</template>

<style scoped>
.basemap {
    cursor: pointer;
}
</style>

<script src="./basemap.js"></script>