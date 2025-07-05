# Moodle便利ツール KIT (Chrome Extention)
> [!TIP]
> 実装して欲しい機能があったらどんどん書いてほしいです。

## 概要
九州工業大学のmoodle専用の拡張機能です。便利機能を随時追加していく予定です。

## インストール方法
[リンク準備中・・・]  

上のリンクから拡張機能をインストールしてください。


このファイルをダウンロードしてインストールすることもできます。その場合常に最新版が使えます。しかしバグもあるかもしれません。  
**この場合は同じアカウント上で同期が正常に行われない可能性があります。**

## 機能 (絶賛募集中)

### 時間割表でアクセス (ver1.0実装)
moodleのコース一覧を時間割形式で素早くアクセスできます。

### 提出物一覧に残り時間追加 **(実装予定)**
提出物一覧に残り時間を追加し、提出までの猶予を確認しやすくできます。

## 機能のリクエスト

Moodle Helper Extensionに実装してほしい機能のアイデアがありましたら、お気軽に [GitHub Issues](https://github.com/harunn416/chrome_Extensionis_moodle/issues) までお寄せください。

新しいIssueを作成する際は、`✨ 新機能の要望` テンプレートを選択し、詳細を記述していただけると助かります。

## 貢献
開発手伝ってくれる人がいたらうれしいな。結構適当です。  
興味あったら下記まで連絡を。  
~~だらだら開発してるから適当でもいいよ。~~

## ライセンス
このプロジェクトは、MITライセンスの下で公開されています。
詳細については、[LICENSE](LICENSE) ファイルを参照してください。

## 開発者向け
> [!IMPORTANT]  
> ``Webpack``を使っています。``Node.js/npm``のインストールを推奨します。
### ファイル構造
```
chrome_Extensionis_moodle_KIT
│  README.md
│  LICENSE
│  manifest.json
│
├─.github (省略)
│
├─content_scripts
│  ├─course_timetable
│  │      content.css
│  │      content.js
│  │      timetableAddPopup.js
│  │      timetableEditPopup.js
│  │
│  └─fun
│  │      fun.js
└─icon
```

### contents_scripts
ここにそれぞれ機能ごとにディレクトリを分けてスクリプトを書いてください。  

### contents_scripts/ course_timetable
「時間割表でアクセス」機能のコードが書いてあります。

### contents_scripts/ fun
ちょっとした遊び心です。隠し機能みたいな？