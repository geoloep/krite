<template>
    <div class="PdokSearchComponent">
        <b-dropdown class="wide" :mobile-modal="false" >
            <b-field slot="trigger">
                <b-input placeholder="Adres zoeken" type="search" v-model="searchString" @keydown.native.prevent.down="selectDown" @keydown.native.prevent.up="selectUp" @keydown.native.prevent.enter="selectEnter"></b-input>
            </b-field>
            <b-dropdown-item v-for="(result, key) in results" :key="key" @click="searchClick(result)" :class="result === highlighted ? 'is-active' : ''"><b-icon :icon="depthToIcon[result.type]" size="is-small"></b-icon> {{result.weergavenaam}}</b-dropdown-item>
        </b-dropdown>
    </div>
</template>

<style>
.PdokSearchComponent .wide, .dropdown-trigger {
    width: 100%;
}
</style>

<script src="./pdokSearch.js"></script>