# raspi camera
LINEからラズパイカメラで撮影するアプリ


## フォルダ構成

```
.
├── README.md
├── bin
│   ├── build           zip パッケージの作成スクリプト
│   ├── deployLambdas   Lambda 関数デプロイ用スクリプト
│   └── setLambdaEnv    Lambda 関数の環境変数設定用スクリプト
└── src
    ├── .env            環境変数定義ファイル
    ├── .env.sample     環境変数定義ファイルのサンプル
    ├── camera.js       Raspberry Pi 側のカメラ処理関数
    ├── constants.js    各種定数定義
    ├── index.js        LINE webhook 用の Lambda 関数
    ├── lib
    │   ├── message.js
    │   ├── photo.js
    │   ├── s3access.js
    │   └── utl.js
    ├── package-lock.json
    └── package.json
```

## 使い方

```bash
git clone
cd lambda
npm install
```

Lambdaへのデプロイ
```bash
./bin/build
./bin/deployLambdas aws_profile_name archive.zip
./bin/deployLambdas aws_profile_name src/.env
```

Raspberry Pi
```bash
```

