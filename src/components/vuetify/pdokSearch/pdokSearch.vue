<template>
    <div class="PdokSearchComponent">
        <v-select label="Adres zoeken" autocomplete :loading="loading" :items="results" item-text="weergavenaam" :filter="filter" v-model="result" :search-input.sync="searchString">
            <template slot="item" slot-scope="data">
                <v-list-tile-content><span><v-icon class="search-icon">{{depthToIcon[data.item.type]}}</v-icon>{{data.item.weergavenaam}}</span></v-list-tile-content>
            </template>
        </v-select>
    </div>
</template>

<style scoped>
.search-icon {
    margin-top: -5px;
    margin-right: 5px;
}
</style>

<script src="./pdokSearch.js"></script>