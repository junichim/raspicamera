
'use strict';

const crypto = require("crypto");
const moment = require("moment");
const s3 = require("./lib/s3access");
const util = require("./lib/utl");
const message = require("./lib/message");
const constant = require("./constants");

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

/**
 * LINE Webhook からの呼び出し関数
 */
exports.handler = async (event) => {
    console.log("start");
    console.log(JSON.stringify(event));

    // メッセージチェック
    const body_str = event.body;
    const signiture = event.headers["X-Line-Signature"];

    if (!isValidMessage(body_str, signiture)) {
        console.warn("message is invalid");
        throw new Error("message is inivalid. maybe falsification.");
    }

    // 受信メッセージの確認
    const body = JSON.parse(body_str);
    console.log("body: " + JSON.stringify(body));
    console.log("num of events: " + body.events.length);

    // イベントでの振り分け
    for (let [idx, evt] of body.events.entries()) {
        console.log("event # " + idx);
        try {
            await dispatchEvent(evt);
        } catch (err) {
            console.warn("error occured at event: " + JSON.stringify(evt));
            console.warn("error: " + JSON.stringify(err));
            console.warn("次のイベントの処理へ移ります");
        }
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify('success'),
    };
    return response;
};

/**
 * イベントに応じた処理の振り分け
 * @param {*} evt 
 */
async function dispatchEvent(evt) {
    console.log("dispatchEvent: " + evt.type);

    switch (evt.type) {
        case "follow":
            console.log("ユーザーがフォローしました: " + evt.source.userId);
            break;
        case "unfollow":
            console.log("ユーザーがブロックしました: " + evt.source.userId);
            break;
        case "postback":
            console.log("postback data: " + JSON.stringify(evt.postback.data));
            break;
        case "message":
            // メッセージの処理
            console.log("message: " + JSON.stringify(evt.message));
            await procMessage(evt);
            break;
        case "accountLink":
            console.log("アカウント連携、ユーザー: " + evt.source.userId);
            console.log("アカウント連携、成否: " + evt.link.result);
            break;
        default:
            console.log("未対応イベント発生: " + evt.type);
    }
};

function isValidMessage(body, signiture) {
    const hmac = crypto.createHmac("sha256", CHANNEL_SECRET);
    hmac.update(body);
    const str = hmac.digest('base64');

    console.log("message body: " + body);
    console.log("message hmac: " + str);
    console.log("signiture   : " + signiture);

    return str === signiture;
};

async function procMessage(evt) {
    switch (evt.message.type) {
        case "text":
            if (isMessageTakePicture(evt.message.text)) {
                console.log("写真撮影指示をS3に記入");
                await setRequestToS3(evt.source.userId, evt.replyToken);
            } else {
                console.log("予期せぬメッセージ内容: " + evt.message.text);
                await message.replyTextMessage(evt.replyToken, "ちょっと何言ってるかわかりません");
            }
            break;
        default:
            console.log("想定外の message: " + JSON.stringify(evt.message));
    };
};

function isMessageTakePicture(msg) {
    if (! msg || msg.length === 0) {
        return false;
    }
    return msg === "写真" || msg === "撮影" || msg == "しゃしん" || msg == "さつえい";
};

async function setRequestToS3(userId, replyToken) {

    let upload_file_name = constant.FILE_PRFX.REQUEST_PRFX +
        moment().utcOffset(constant.JST).format(constant.DATE_FMT.S3_FILENAME_FMT);

    let contents = {
        "date": moment().utcOffset(constant.JST).format(constant.DATE_FMT.DIRECTION_FMT),
        "replyToken": replyToken,
        "userId": userId    
    }

    let param = {
        "Bucket": process.env.S3_BUCKET_NAME,
        "Key" : upload_file_name,
        "Body" : JSON.stringify(contents),
    };

    console.log("setRequestToS3 param: " + JSON.stringify(param));
    try {
        await s3.upload(param);
    } catch(err) {
        util.handleError(err, "S3 への撮影指示記入失敗");
    }
};






