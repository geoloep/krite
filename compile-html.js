'use strict';

var fs = require('fs');
var util = require('util');
var ractive = require('ractive');

/* This script pre-parses all the ractive templates */

fs.readdir('src/apps', (err, apps) => {
    if (err) throw err;

    for (let app of apps) {
        if (!(app.includes('.'))) {
            fs.readdir(`src/apps/${app}`, (err, files) => {
                if (err) throw err;

                for (let file of files) {
                    if (file.includes('.html')) {
                        console.log(app, file);
                        
                        fs.readFile(`src/apps/${app}/${file}`, { encoding: 'utf-8' }, (err, data) => {
                            if (err) throw err;

                            let parsed = 'module.exports=' + JSON.stringify(ractive.parse(data));

                            fs.writeFile(`lib/apps/${app}/${file}`, parsed, (err) => {
                                if (err) throw err;
                                console.log(app, file)
                            })
                        })
                    };
                };
            });
        }
    }
});