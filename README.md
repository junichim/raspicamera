# raspi camera
LINEからラズパイカメラで撮影するアプリ


## フォルダ構成

```
.
├── README.md        
├── bin
│   ├── build           zip パッケージの作成スクリプト
│   ├── camera_start    カメラサーバー起動スクリプト
│   ├── deployLambdas   Lambda 関数デプロイ用スクリプト
│   └── setLambdaEnv    Lambda 関数の環境変数設定用スクリプト
├── etc
│   ├── camera-server.logrotate.conf    logrotate定義ファイル
│   └── camera-server.service           systemd 設定ファイル
└── src
    ├── .env            環境変数定義ファイル
    ├── .env.sample     環境変数定義ファイルのサンプル
    ├── camera.js       Raspberry Pi 側のカメラ処理関数
    ├── constants.js    各種定数定義
    ├── index.js        LINE webhook 用の Lambda 関数
    ├── lib
    │   ├── message.js
    │   ├── photo.js
    │   ├── photo.sh    写真撮影シェルスクリプト
    │   ├── s3access.js
    │   └── utl.js
    ├── package-lock.json    
    └── package.json
```

## 使い方

インストール
```bash
cd ~/work
git clone https://github.com/junichim/raspicamera.git
cd raspicamera/src
npm install
```

raspicamera/src/.env.sample を参考に環境変数を設定
aws のプロファイルも定義しておくこと
```bash
cp -p raspicamera/src/.env.sample raspicamera/src/.env
vi raspicamera/src/.env
```

Lambdaへのデプロイ
```bash
./bin/build
./bin/deployLambdas aws_profile_name archive.zip
./bin/setLambdaEnv aws_profile_name src/.env
```

Raspberry Pi でカメラサーバーを起動
```bash
./bin/camera_start
```

Raspberry Pi でのカメラサーバーの自動起動
```bash
sudo mkdir /var/log/camera-server
sudo cp -p ./etc/camera-server.service /etc/systemd/system/
sudo chown root:root /etc/systemd/system/camera-server.service
sudo cp -p ./etc/camera-server.logrotate.conf /etc/logrotate.d/camera-server
sudo systemctl daemon-reload
sudo systemctl enable camera-server
sudo systemctl start camera-server
```

