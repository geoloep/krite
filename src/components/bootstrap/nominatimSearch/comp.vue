<template>
    <div class="dropdown" id="pdokSearchApp">
        <div class="input-group">
            <input type="text" class="form-control" placeholder="Search" @focus="inputFocus" @blur="inputBlur" @keyup.down="selectDown" @keyup.up="selectUp" @keyup.esc="inputBlur" @keyup.enter="searchEnter" v-model="searchString">
            <span class="input-group-btn">
                <button class="btn btn-default" type="button" @click="search" @focus="inputFocus" @blur="inputBlur"><span class="fa fa-search"></span></button>
            </span>
        </div>

        <ul class="dropdown-menu" aria-labelledby="dropdownMenu1" :style="dropdownStyle">
                <li v-for="(r, i) in results" :class="{active: num === i}" @mousedown="searchClick(r)" :key="i">
                    <a href="#">
                        <span class="icon"><img v-if="r.icon" :src="r.icon"><span v-else class="fa fa-map-marker"></span></span>{{r.display_name}}
                    </a>
                </li>
        </ul>
    </div>
</template>

<style scoped>
.icon {
    width: 30px;
    display: inline-block;
}

.icon > img {
    margin: auto;
}

.icon > .fa {
    margin-left: 6px;
}
</style>

<script src="./script.js"></script>