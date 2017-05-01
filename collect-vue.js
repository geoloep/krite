'use strict';

var fse = require('fs-extra');

var filterFunc = (src, dest) => {
    if (fse.statSync(src).isDirectory()) {
        return true;
    }

    var t =  /.vue$/.test(src);

    if (t) {
        console.log('Collected ' + src);
    } else {
        // console.log('Skipped ' + src);
    }

    return t;
};

try {
    fse.copySync('./src', './lib', {
        filter: filterFunc
    });
} catch (e) {
    console.log(e);
}