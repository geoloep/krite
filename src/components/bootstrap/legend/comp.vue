<template>
    <div class="LegendComponent">
        <h3>{{locale.legend}}</h3>

        <template v-for="item in items">
            <h4>{{item.title}}
                <span class="pull-right">
                    <div class="btn-group btn-group-xs pull-right">
                        <button v-for="button in getButtons(item.name)" @click="buttonClick(button)" type="button" class="btn btn-link">
                            <span class="fa" :class="['fa-' + button.icon, button.disabled && button.flipable ? 'text-muted' : '']"></span>
                        </button>
                    </div>
                </span>
            </h4>

            <div v-if="getLegendState(item.name)" v-html="item.legend"></div>

        </template>
    </div>
</template>

<script src="./script.js"></script>