#!/bin/bash
#
#

set -eu


function usage() {
    echo "photo.sh  output_filename  output_thumbnail_filename"
}

if [ $# -ne 2 ]
then
    usage
    exit 1
fi

IMG_FN=$1
THUMB_FN=$2

# 撮影
/usr/bin/raspistill -w 640 -h 480 -th none -n -t 10 -q 75 -o ${IMG_FN}

# サムネイル生成
/usr/bin/convert ${IMG_FN} -thumbnail 200x200 ${THUMB_FN}


