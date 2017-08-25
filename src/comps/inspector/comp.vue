<template>
    <div tabindex="0" class="InspectorComponent" @keyup.right="shiftIndex(1)" @keyup.left="shiftIndex(-1)">

        <h3>{{locale.title}}</h3>
        <form>
            <div class="form-group">
                <label for="inspecteerlaag">{{locale.layer}} </label>
                <select id="inspecteerlaag"
                        class="form-control input-sm"
                        v-model="layer">
                    <option selected></option>
                    <option v-for="l in layers">{{l.name}}</option>
                </select>
            </div>
        </form>
    
        <div class="btn-group btn-block">
            <button type="button"
                    class="btn btn-default col-xs-10 col-sm-10 col-md-10 col-lg-10"
                    @click="modeClick">
                <component v-if="allowed"
                           :is="modename" :desc="locale.tools[modename]"></component>
                <none v-else :desc="locale.tools.none"></none>
            </button>
            <button type="button"
                    class="btn btn-default dropdown-toggle col-xs-2 col-sm-2 col-md-2 col-lg-2"
                    @click="modeDropDownClick"><span class="caret"></span></button>
            <ul class="dropdown-menu"
                style="width: 100%;"
                :style="{display: modeDropDownStyle}">
                <template v-if="allowed">
                    <li>
                        <a href="#"
                           @click="modeSelect('point')">
                            <point :desc="locale.tools.point"></point>
                        </a>
                    </li>
                    <template v-if="modeShapeAllowed">
                        <li>
                            <a href="#"
                               @click="modeSelect('box')">
                                <box :desc="locale.tools.box"></box>
                            </a>
                        </li>
                        <li>
                            <a href="#"
                               @click="modeSelect('tpolygon')">
                                <tpolygon :desc="locale.tools.tpolygon"></tpolygon>
                            </a>
                        </li>
                        <li>
                            <a href="#"
                               @click="modeSelect('tpolyline')">
                                <tpolyline :desc="locale.tools.tpolyline"></tpolyline>
                            </a>
                        </li>
                    </template>
                </template>
                <li v-else>
                    <a href="#">
                        <none :desc="locale.tools.none"></none>
                    </a>
                </li>
            </ul>
        </div>
    
        <div v-if="modeShapeAllowed"
             id="object-form">
            <div class="form-group">
                <label for="inspecteerfeature">Objecten: </label>
                <div class="input-group">
                    <select id="inspecteerfeature"
                            class="form-control input-sm"
                            v-model="index">
                        <option v-for="(feature, key) in features"
                                :value="key">{{feature.properties[namefield]}}</option>
                    </select>
                    <span class="input-group-btn">
                        <button class="btn btn-sm btn-default" @click="shiftIndex(-1)"><i class="fa fa-caret-left"></i></button>
                        <button class="btn btn-sm btn-default" @click="shiftIndex(1)"><i class="fa fa-caret-right"></i></button>
                      </span>
                </div>
            </div>
        </div>
        <p v-else>&nbsp;</p>
    
        <table v-if="allowed && features[index]"
               class="table">
            <tbody>
                <tr>
                    <th>Attribuut</th>
                    <th>Waarde</th>
                </tr>
                <tr v-for="row in fillTable">
                    <td>{{row.key}}</td>
                    <td v-html="row.value"></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script src="./script.js"></script>

<style>
    .InspectorComponent {
        outline: none;
    }
</style>
