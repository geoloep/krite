<template>
    <div class="dropdown" id="pdokSearchApp">
        <input type="text" class="form-control" placeholder="Adres zoeken" @focus="inputFocus" @blur="inputBlur" @keyup.down="selectDown" @keyup.up="selectUp" @keyup.esc="inputBlur" @keyup.enter="searchEnter" v-model="searchString">

        <ul class="dropdown-menu" aria-labelledby="dropdownMenu1" :style="dropdownStyle">
            <template v-for="depth in depthOrder">
                <li v-for="(r, i) in results[depth]" :class="{active: cursor.depth === depth && cursor.num === i}" @mousedown="searchClick(r)">
                    <a href="#"><span class="fa fa-fw" :class="[depthToIcon[depth]]"></span>
                        <span v-html="r.suggest"></span>
                    </a>
                </li>
            </template>
        </ul>
    </div>
</template>

<script src="./script.js"></script>