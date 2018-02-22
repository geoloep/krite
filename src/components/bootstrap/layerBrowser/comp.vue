<template>
    <div id="LayerBrowserApp">
        <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title">{{locale.title}}</h4>
        </div>
        <div class="modal-body">
            <div class="row">
                <div class="col-md-6">
                    <form>
                        <div class="form-group">
                            <label>{{locale.data_source}}</label>
                            <select class="form-control input-sm" v-model="selected.source">
                                <option selected></option>
                                <option v-for="source in service.list">{{source}}</option>
                            </select>
                        </div>
                    </form>
                    
                    <div class="form-group has-feedback">
                        <input class="form-control input-sm" :placeholder="locale.filter" v-model="layerFilter" />
                        <span class="fa fa-search form-control-feedback"></span>
                    </div>

                    <p class="text-center" v-if="status.sourceLoading"><span class="fa fa-circle-o-notch fa-spin"></span></p>
                    <div class="list-group list" v-else>
                        <a v-for="layer in filteredLayerList" href="#" class="list-group-item" @click="selectLayer(layer)"><span class="laag">{{layer}}</span></a>
                    </div>
                </div>

                <div class="col-md-6">
                    <h4>{{selected.name}}</h4>
                    <p v-if="status.layerLoading" class="text-center"><span class="fa fa-circle-o-notch fa-spin"></span></p>
                    <template v-else>
                        <div v-html="selected.layer.preview"></div>
                        <p>{{selected.layer.abstract}}</p>
                    </template>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">{{locale.close}}</button>
            <a type="button" class="btn btn-default xs-hidden" :href="permalink" target="_blank" :disabled="!status.layerAddable"><span class="fa fa-link"></span>&nbsp;{{locale.permalink}}</a>
            <button type="button" class="btn btn-success" @click="addLayer" :disabled="!status.layerAddable"><span class="fa fa-plus"></span>&nbsp;{{locale.add_layer}}</button>
        </div>
    </div>
</template>

<script src="./script.js"></script>