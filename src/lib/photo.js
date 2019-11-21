
'use strict';

const childProcess = require('child_process');

exports.getPhoto = async function (imgFn) {
    return new Promise(function(resolve, reject) {
        childProcess.exec("/usr/bin/raspistill -w 640 -h 480 -th none -n -t 100 -q 75 -o " + imgFn, function(err, stdout, stderr) {
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

exports.getThumbnail = async function (imgFn, thumbFn) {
    return new Promise(function(resolve, reject) {
        childProcess.exec("/usr/bin/convert " + imgFn + " -thumbnail 200x200 " + thumbFn, function(err, stdout, stderr) {
            if (err) {
                console.error("getThumbnail:" + JSON.stringify(err));
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

