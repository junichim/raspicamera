
'use strict';

const AWS = require("aws-sdk");

let s3 = new AWS.S3();

exports.upload = async function(param) {
    return new Promise(function(resolve, reject) {
        s3.upload(param, function(err, data) {        
            if (err) {
                console.error("upload:" + JSON.stringify(err));
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

exports.list = async function(param) {
    return new Promise(function(resolve, reject) {
        s3.listBuckets(param, function(err, data) {        
            if (err) {
                console.error("list:" + JSON.stringify(err));
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

exports.get = async function(param) {
    return new Promise(function(resolve, reject) {
        s3.getObject(param, function(err, data) {        
            if (err) {
                console.error("get:" + JSON.stringify(err));
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

exports.delete = async function(param) {
    return new Promise(function(resolve, reject) {
        s3.deleteObject(param, function(err, data) {        
            if (err) {
                console.error("delete:" + JSON.stringify(err));
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

