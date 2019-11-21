
'use strict';

const crypto = require("crypto");

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
