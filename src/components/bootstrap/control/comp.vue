<template>
    <div class="btn-group btn-group-justified" role="group">
        <div v-for="(app, name) in structure" :key="name" class="btn-group" role="group">
            <button type="button" class="btn" :class="[name === active.name ? 'btn-primary' : 'btn-default']" @click="activate(name)" v-html="app"></button>
        </div>
    </div>
</template>

<script src="./script.js"></script>