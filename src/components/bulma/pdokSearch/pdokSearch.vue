<template>
    <div class="PdokSearchComponent">
        <vb-dropdown class="wide" :items="results" is-clickable is-reactive is-blurable>
            <div class="control" :class="loading ? 'is-loading is-medium' : ''">
                <input class="input" type="search" placeholder="Adres zoeken" v-model="searchString" @keydown.prevent.down="selectDown" @keydown.prevent.up="selectUp" @keydown.prevent.enter="selectEnter">
            </div>
            <a slot="items" slot-scope="{item}" class="dropdown-item" :class="item === highlighted ? 'is-active' : ''" @mousedown="searchClick(item)">
                <div class="icon is-small"><span class="mdi" :class="depthToIcon[item.type]"></span></div> {{item.weergavenaam}}
            </a>
        </vb-dropdown>
    </div>
</template>

<style>
.PdokSearchComponent .wide,
.dropdown-trigger {
  width: 100%;
}
</style>

<script src="./pdokSearch.js"></script>