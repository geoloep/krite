<template>
    <div class="NomatimSearchComponent">
        <v-select label="Search" autocomplete :loading="loading" :items="results" item-text="display_name" :filter="filter" v-model="result" append-icon="search" :append-icon-cb="search" @keyup="keyup" :search-input.sync="searchString">
            <template slot="item" slot-scope="data">
                <v-list-tile-content v-text="data.item.display_name"></v-list-tile-content>
            </template>
        </v-select>
    </div>
</template>

<script src="./nomatimSearch.js"></script>