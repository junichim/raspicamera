
'use strict';

const request = require("request-promise");
const util = require('./utl');

// LINE API
const BASE_URL = "https://api.line.me/v2/bot/";
const REPLY_URL = BASE_URL + "message/reply";
const PUSH_URL = BASE_URL + "message/push";

const ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

/**
 * テキスト返信メッセージの送信
 * @param {String} replyToken
 * @param {String} msgText 送信したいメッセージ
 */
exports.replyTextMessage = async function (replyToken, msgText) {
    console.log("replyTextMessage start");
    console.log("replyToken: " + JSON.stringify(replyToken));

    // 返信文作成
    let messages = [];
    let msg = {
        "type": "text",
        "text": msgText,
    };
    messages.push(msg);

    // 返信処理
    try {
        await replyMessageRaw(ACCESS_TOKEN, replyToken, messages);
    } catch (err) {
        util.handleError(err, "replyTextMessage exception occured");
    }
};

/**
 * 画像メッセージの送信
 *
 * 返信でメッセージを送り、失敗したらpushメッセージに切り替えて送る
 *
 * @param {String} replyToken
 * @param {String} 送信したい画像のURL
 * @param {String} 送信したい画像のサムネイルのURL
 */
exports.sendImageMessage = async function (replyToken, lineId, mainImageUrl, thumbImageUrl) {
    console.log("sendImageMessage start");
    try {
        await replyImageMessage(replyToken, mainImageUrl, thumbImageUrl);
    } catch (err) {
        console.error("replyImageMessage failed.: " + JSON.stringify(err));
        console.log("Try to push an image message.");

        try {
            await pushImageMessage(lineId, mainImageUrl, thumbImageUrl);
        } catch (err) {
            util.handleError(err, "sendImageMessage exception occured");
        }
    }
};

/**
 * 画像返信メッセージの送信
 * @param {String} replyToken
 * @param {String} 送信したい画像のURL
 * @param {String} 送信したい画像のサムネイルのURL
 */
async function replyImageMessage(replyToken, mainImageUrl, thumbImageUrl) {
    console.log("replyImageMessage start");
    console.log("replyToken: " + JSON.stringify(replyToken));

    // 返信文作成
    let messages = [];
    let msg = {
        "type": "image",
        "originalContentUrl": mainImageUrl,
        "previewImageUrl": thumbImageUrl,
    };
    messages.push(msg);

    // 返信処理
    try {
        await replyMessageRaw(ACCESS_TOKEN, replyToken, messages);
    } catch (err) {
        util.handleError(err, "replyImageMessage exception occured");
    }
};

/**
 * 投稿の送信（プッシュ送信）
 * @param {String} lineId
 * @param {String} msgText
 */
exports.pushMessage = async function (lineId, msgText) {
    console.log("pushMessage start");
    console.log("destination: " + lineId);

    // 返信文作成
    let messages = [];
    let msg = {
        "type": "text",
        "text": msgText,
    };
    messages.push(msg);

    // 返信処理
    try {
        await pushMessageRaw(ACCESS_TOKEN, lineId, messages);
    } catch (err) {
        util.handleError(err, "pushMessage exception occured");
    }
};

/**
 * 画像の送信（プッシュ送信）
 * @param {String} lineId
 * @param {String} 送信したい画像のURL
 * @param {String} 送信したい画像のサムネイルのURL
 */
async function pushImageMessage(lineId, mainImageUrl, thumbImageUrl) {
    console.log("pushImageMessage start");
    console.log("destination: " + lineId);

    // 返信文作成
    let messages = [];
    let msg = {
        "type": "image",
        "originalContentUrl": mainImageUrl,
        "previewImageUrl": thumbImageUrl,
    };
    messages.push(msg);

    // 返信処理
    try {
        await pushMessageRaw(ACCESS_TOKEN, lineId, messages);
    } catch (err) {
        util.handleError(err, "pushImageMessage exception occured");
    }
};



async function replyMessageRaw(channelAccessToken, replyToken, messages) {
    const headers = {
        "Content-type": "application/json; charset=UTF-8",
        "Authorization": "Bearer " + channelAccessToken
    };
    const options = {
        url: REPLY_URL,
        method: "POST",
        headers: headers,
        json: {
            "replyToken": replyToken,
            "messages": messages,
        }
    };

    console.log("reply object: " + JSON.stringify(options));

    return request(options)
        .then((body) => {
            console.log("replyMessageRaw success: " + JSON.stringify(body));
            return "finish";
        })
        .catch((err) => {
            console.error("replyMessageRaw result code: " + err.statusCode);
            console.error("replyMessageRaw error: " + JSON.stringify(err));
            throw new Error(err.message);
        });
};

async function pushMessageRaw(channelAccessToken, lineId, messages) {
    const headers = {
        "Content-type": "application/json; charset=UTF-8",
        "Authorization": "Bearer " + channelAccessToken
    };
    const options = {
        url: PUSH_URL,
        method: "POST",
        headers: headers,
        json: {
            "to": lineId,
            "messages": messages,
        }
    };

    return request(options)
        .then((body) => {
            console.log("pushMessageRaw success: " + JSON.stringify(body));
            return "finish";
        })
        .catch((err) => {
            console.error("pushMessageRaw result code: " + err.statusCode);
            console.error("pushMessageRaw error: " + JSON.stringify(err));
            throw new Error(err.message);
        });
};
