
'use strict';

// 日本のタイムゾーン
const JST='+09:00';

// 日付フォーマット
const DATE_FMT = {
    S3_FILENAME_FMT : "YYYY-MM-DDTHH-mm-ss",
    DIRECTION_FMT : "YYYY-MM-DDTHH:mm:ss.SSSZ",
};

// ファイル名のプレフィックス
const FILE_PRFX = {
    REQUEST_PRFX : "snapshot_",
    IMAGE_PRFX : "image_",
};

exports.JST = JST;
exports.DATE_FMT = DATE_FMT;
exports.FILE_PRFX = FILE_PRFX;
