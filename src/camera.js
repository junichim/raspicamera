'use strict';

const moment = require("moment");
const fs = require('fs');
const path = require('path');
const s3 = require("./lib/s3access");
const photo = require("./lib/photo");
const util = require("./lib/utl");
const message = require("./lib/message");
const constant = require("./constants");

const SEC2MS = 1000;        // sec -> mili sec
const PERIOD = 10 * SEC2MS;

const IMAGE_THUMB_SUFX = "_thumb";
const IMAGE_EXT = ".jpg";

const PHOTO_BASE_URL = process.env.PHOTO_BASE_URL;

// ループ開始
setInterval(main, PERIOD);

async function main() {

    // S3 ファイルチェック
    let data;
    try {
        data = await getRequestsList();
    } catch (err) {
        util.handleError(err, "写真撮影リクエストの取得失敗");
    }
    console.log("S3 request files: " + JSON.stringify(data));

    // 撮影指示ファイル分だけループ
    for (let content of data.Contents) {
        console.log("撮影指示: " + JSON.stringify(content));
        try {
            await processRequest(content);
            console.log("撮影指示完了");
        } catch(err) {
            console.error("撮影指示処理においてエラーが発生");
        }
        console.log("次の撮影指示の処理へ進みます");
    }
};

async function processRequest(content) {    
    let request
    try {
        request = await getRequest(content);
    } catch(err) {
        util.handleError(err, "撮影指示の取得に失敗");
    }
    console.log("request is: " + JSON.stringify(request));

    // 写真撮影処理
    // 成否にかかわらず、撮影指示は削除する
    try {
        await processPhoto(request);
    } catch (err) {
        console.error("写真撮影処理に失敗: " + JSON.stringify(err));
    } finally {
        // S3 撮影指示ファイル削除
        try {
            deleteRequest(content);
        } catch(err) {
            util.handleError(err, "S3 撮影指示ファイルの削除失敗");
        }
    }
}

async function processPhoto(request) {

    // ファイル名生成
    let baseFn = constant.FILE_PRFX.IMAGE_PRFX + moment().utcOffset(constant.JST).format(constant.DATE_FMT.S3_FILENAME_FMT);
    let imgFn = baseFn + IMAGE_EXT;
    let thumbFn = baseFn + IMAGE_THUMB_SUFX + IMAGE_EXT;

    // 写真撮影&サムネイル作成
    try {
        await photo.getPhoto(imgFn);
        await photo.getThumbnail(imgFn, thumbFn);
    } catch(err) {
        util.handleError(err, "写真撮影に失敗");
    }
    
    try {
        // S3 写真アップロード
        await uploadImage(imgFn);
        await uploadImage(thumbFn);

        // LINE 返信
        await message.replyImageMessage(request.replyToken, PHOTO_BASE_URL + imgFn, PHOTO_BASE_URL + thumbFn);
    } catch(err) {
        console.error("LINE 画像メッセージの返信失敗: " + JSON.stringify(err));

        try {
            await message.replyTextMessage(request.replyToken, "写真の取得に失敗しました");
        } catch (err) {
            util.handleError(err, "LINE メッセージへの返信失敗");
        }
    } finally {
        // ローカル画像ファイルの削除
        try {
            await photo.deletePhoto(imgFn);
            await photo.deletePhoto(thumbFn);
        } catch(err) {
            util.handleError(err, "ローカル画像ファイルの削除失敗");
        }
    }
}

async function getRequestsList() {
    let param = {
        "Bucket": process.env.S3_BUCKET_NAME,
        "Prefix": constant.FILE_PRFX.REQUEST_PRFX,
    };

    console.log("getRequestsList param: " + JSON.stringify(param));
    let data;
    try {
        data = await s3.list(param);
    } catch(err) {
        util.handleError(err, "S3 バケットのファイルリスト取得失敗");
    }    
    return data;
};

async function getRequest(content) {
    let param = {
        "Bucket": process.env.S3_BUCKET_NAME,
        "Key": content.Key,
    };

    console.log("getRequest param: " + JSON.stringify(param));
    let data;
    try {
        data = await s3.get(param);
    } catch(err) {
        util.handleError(err, "S3 内のファイル取得失敗");
    }    
    console.log("data: " + JSON.stringify(data));
    return JSON.parse(data.Body.toString());
}

async function deleteRequest(content) {
    let param = {
        "Bucket": process.env.S3_BUCKET_NAME,
        "Key": content.Key,
    };

    console.log("deleteRequest param: " + JSON.stringify(param));
    try {
        await s3.delete(param);
    } catch(err) {
        util.handleError(err, "S3 内のファイル削除失敗");
    }
}

async function uploadImage(fn) {
    
    let fileStream = fs.createReadStream(fn);
    fileStream.on('error', function(err) {
        console.log('File Error', err);
        throw new Error(err);
    });

    let param = {
        "Bucket": process.env.S3_BUCKET_NAME_PHOTO,
        "Key": path.basename(fn), // パス付の場合ファイル名のみに変更
        "Body": fileStream,
    };
    
    console.log("uploadImage param: " + JSON.stringify(param));
    try {
        await s3.upload(param);
    } catch(err) {
        util.handleError(err, "S3 へのファイルアップロード失敗");
    }
}
