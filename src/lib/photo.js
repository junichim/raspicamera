
'use strict';

const childProcess = require('child_process');

const PHOTO_SCRIPT = "lib/photo.sh";

exports.getPhoto = async function (imgFn, thumbFn) {
    return new Promise(function(resolve, reject) {
        let cwd = process.cwd();
        childProcess.exec(cwd + "/" + PHOTO_SCRIPT + " " + imgFn + " " + thumbFn, function(err, stdout, stderr) {
            if (err) {
                console.error("getPhoto:" + JSON.stringify(err));
                console.error("stderr: " + stderr);
                reject(err);
            } else {
                resolve(stdout);
            }
        });
    });
}

exports.deletePhoto = async function (fn) {
    return new Promise(function(resolve, reject) {
        childProcess.exec("/bin/rm -f " + fn, function(err, stdout, stderr) {
            if (err) {
                console.error("deletePhoto:" + JSON.stringify(err));
                console.error("stderr: " + stderr);
                reject(err);
            } else {
                resolve(stdout);
            }
        });
    });
}

