
'use strict';

const crypto = require("crypto");

async function sleep (term) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, term);
    });
}
exports.sleep = sleep

exports.interval = async function (callback, term) {
    while(true) {
        //const st_dt = Date.now();
        //console.log("start");
        await Promise.all([callback(), sleep(term)]);
        //console.log("end. elapsed is " + (Date.now() - st_dt));
    }
}

exports.getHash = function (str) {
    let sha256 = crypto.createHash("sha256");
    sha256.update(str);
    return sha256.digest("hex");
}

exports.handleError = function (err, base_message) {
    if (!base_message) {
        base_message = "(no message)";
    }
    if (err instanceof Error) {
        console.error(base_message + ": " + err.name + ", " + err.message);
        throw err;
    } else {
        let msg = base_message + (!err ? "" : ": " + JSON.stringify(err));
        console.error(msg);
        throw new Error(msg);
    }
}
