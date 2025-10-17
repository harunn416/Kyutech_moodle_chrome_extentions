# Moodle 便利ツール KIT (Chrome Extention)

> [!TIP]
> 実装して欲しい機能があったらどんどん書いてほしいです。

## 概要

九州工業大学の moodle 専用の拡張機能です。便利機能を随時追加していく予定です。

## インストール方法
[インストールリンク](https://chromewebstore.google.com/detail/九工大moodle便利ツール/hhbkgambgapnagjlbgmcaebcndlodlje?authuser=0&hl=ja)  

上のリンクから拡張機能をインストールしてください。

このファイルをダウンロードしてインストールすることもできます。その場合常に最新版が使えます。しかしバグもあるかもしれません。  
**この場合は同じアカウント上で同期が正常に行われない可能性があります。**

## 機能 (絶賛募集中)

### 時間割表でアクセス (ver1.0 実装)

moodle のコース一覧を時間割形式で素早くアクセスできます。

### 提出物一覧に残り時間 (ver1.1 実装)

提出物一覧に残り時間を追加し、提出までの猶予を確認しやすくできます。

### 簡易メモ機能 **new**(ver1.2 実装)
コースごとに簡易的なメモを残すことができます。  
※メモはデバイス間で同期できません。インポート・エクスポート機能を活用してください。(将来的には外部サーバーを使って同期可能にする予定です。)

## 機能のリクエスト

Moodle Helper Extension に実装してほしい機能のアイデアがありましたら、お気軽に [GitHub Issues](https://github.com/harunn416/chrome_Extensionis_moodle/issues) までお寄せください。

新しい Issue を作成する際は、`✨ 新機能の要望` テンプレートを選択し、詳細を記述していただけると助かります。

## 貢献

開発手伝ってくれる人がいたらうれしいな。結構適当です。  
興味あったら下記まで連絡を。  
~~だらだら開発してるから適当でもいいよ。~~

## ライセンス

このプロジェクトは、MIT ライセンスの下で公開されています。
詳細については、[LICENSE](LICENSE) ファイルを参照してください。

# 開発者向け

> [!IMPORTANT]  
> `Webpack`を使っています。`Node.js` `npm`のインストールを推奨します。  
> なるべく`README`を参考に開発をしてください。

> [!WARNING]  
> ~~webpack でバンドルする際は`developmet`ではなく`production`を使用してください。拡張機能では`eval`が使用できないからです。コンソールで`npm run build`を実行すればいいようになってます。~~  
> 現在は`development`でも読み込むようになっています。`npm run dev`でもビルド(バンドル)可能です。

> [!CAUTION] > **悪意のあるスクリプトを絶対に入れないでください！**  
> なるべくブラウザ内で処理を完結させるようにしてください。  
> また、学生情報(氏名や学籍番号など)の取り扱いは慎重になってください。取得しないに越したことはありません。

わからなければ、これらの文章を AI にぶち込めば解決するでしょう。

## 導入

1. git ファイルのコピー。`git clone [URL]`をターミナルで実行。URL はこのページの一番上の緑色の`code`から取得可能。
1. npm で必要なライブラリを取得。`npm i`をターミナルで実行。これにより必要なライブラリが取得できる。
1. dist ファイルを出力しビルド(バンドル)する。`npm run dev`をターミナルで実行。本番用の出力は`npm run build`を実行。
1. ブラウザの拡張機能タブの`パッケージ化されていない拡張機能を読み込む`から`dist`フォルダを読み込む。
   > [!important]
   > 拡張機能はルートディレクトリを読み込むのではなく、必ず`dist`フォルダを読み込んでください。`manifest.json`が読み込まれません。

## 機能実装

### ブランチの作成

新しい機能実装時は`develop`ブランチに**ブランチの作成**をしてください。全員が気持ちよく開発できるようにご協力お願いします。  
新機能追加の場合は`feature/[機能名]`といった感じにしてもらうと助かります。  
↓ 命名規則に関してはこちらを参考にしています。  
[ブランチの命名規則](https://qiita.com/Hashimoto-Noriaki/items/5d990e21351b331d2aa1)  
また、マージする際は**プルリクエストの作成**をお願いします。

### 実装ファイル作成

機能を実装する際は、`content_scripts`フォルダの中に機能に適した重複のない名前のフォルダを作ってください。フォルダ名が機能を区別するためのキーワードになります。

### JavaScript

JavaScript ファイルは`content.js`という名前にし、他の JavaScript ファイルは必要な関数を`content.js`で import してください。

そして、ユーザーが機能のオンオフを選択できるようにするため、以下のスクリプトを冒頭にコピペしてください。

```JS
/* ストレージから機能のオンオフを読み込んで実行するか判断する部分 *********************/
// この機能に対応するキー名を定義
// キー名はバンドル時に置換される
const FEATURE_KEY = '__FEATURE_KEY_PLACEHOLDER__';

/**
 * この機能が有効になっているかブラウザのストレージから確認する関数
 * @returns {Promise<boolean>} 機能が有効ならtrue、無効ならfalse
 */
async function shouldRun() {
    try {
        const result = await chrome.storage.sync.get("toggle_"+FEATURE_KEY);
        // キーが存在しない場合はtrue（ON）をデフォルトとする
        return result["toggle_"+FEATURE_KEY] !== false;
    } catch (error) {
        console.error(`機能(${FEATURE_KEY})の有効/無効状態の取得に失敗しました:`, error);
        return true; // エラー時も安全策としてONを返す
    }
}
(async () => {
    if (await shouldRun()) {
      main();
    } else {
      console.log(`機能(${FEATURE_KEY})は無効になっています。`);
    }
})();
/********************************************************************************/

// ブラウザ読み込み時にメイン関数を実行。
function main(){}
```

そして`main`関数のなかに処理を書いてください。  
外に関数を定義して呼び出すことも可能です。動作の意図が理解できているなら多少改変しても構いません。  
ユーザーの意向にかかわらず強制的に機能をオンにする場合は、後述の`config.json`の`ForceExecution`を`true`にしてください。

> [!TIP]
> 要素を監視するなら`MutationObserver`を利用することをおすすめします。  
> → [MDN MutationObserver](https://developer.mozilla.org/ja/docs/Web/API/MutationObserver)  
> ``util``フォルダの``mutationObserver.js``をインポートして活用できます。

そして、ユーザーが機能のオンオフを選択できるようにするため、以下のスクリプトを冒頭にコピペしてください。
```JS
/* ストレージから機能のオンオフを読み込んで実行するか判断する部分 *********************/
// この機能に対応するキー名を定義
// キー名はバンドル時に置換される
const FEATURE_KEY = '__FEATURE_KEY_PLACEHOLDER__';

/**
 * この機能が有効になっているかブラウザのストレージから確認する関数
 * @returns {Promise<boolean>} 機能が有効ならtrue、無効ならfalse
 */
async function shouldRun() {
    try {
        const result = await chrome.storage.sync.get("toggle_"+FEATURE_KEY);
        // キーが存在しない場合はtrue（ON）をデフォルトとする
        return result["toggle_"+FEATURE_KEY] !== false;
    } catch (error) {
        console.error(`機能(${FEATURE_KEY})の有効/無効状態の取得に失敗しました:`, error);
        return true; // エラー時も安全策としてONを返す
    }
}
(async () => {
    if (await shouldRun()) {
      main();
    } else {
      console.log(`機能(${FEATURE_KEY})は無効になっています。`);
    }
})();
/********************************************************************************/

// ブラウザ読み込み時にメイン関数を実行。
function main(){}
```
そして``main``関数のなかに処理を書いてください。  
外に関数を定義して呼び出すことも可能です。動作の意図が理解できているなら多少改変しても構いません。  
ユーザーの意向にかかわらず強制的に機能をオンにする場合は、後述の``config.json``の``ForceExecution``を``true``にしてください。

> [!TIP]
> 要素を監視するなら``MutationObserver``を利用することをおすすめします。  
> → [MDN MutationObserver](https://developer.mozilla.org/ja/docs/Web/API/MutationObserver)

### css

`content.js`ファイルにインポートしてください。

### アセット

アセット(jpg,png,json,etc...)は、`assets`の中に機能実装の際につけた名前と同じフォルダを作成し入れてください。参照は`../../assets/[機能名]/[ファイル名]`で取得できます。パスはバンドル時に自動的に変更してくれます。

### config.json

> [!IMPORTANT] > `config.json`へ機能情報を記入してください。

`content_scripts`の中に作成した機能フォルダの中に`config.json`を作成し、以下のスクリプトを記述してください。URL は機能してほしいサイトのアドレスを入力してください。URL は複数記述可能です。

```json
{
  "matches": ["https://*.kyutech.ac.jp/*"],
  "displayName": "[機能表示名]",
  "description": "[ここに機能の説明を記述。簡潔に10~40字程度で。]",
  "ForceExecution": false, //省略可
  "initialState": true //省略可
}
```

> [!TIP] > `matches`の部分は JS ファイルが動いてほしい URL を記述する部分です。`*`は任意の文字列となっています。なので、
>
> ```
> https://*.kyutech.ac.jp/*
> ```
>
> は moodle のすべてのサイトで実行され、
>
> ```
> https://*.kyutech.ac.jp/my/courses.php*
> ```
>
> は`マイコース`タブでしか実行されません。
> 最後に`*`がついているのはプレースホルダに対応するためです。(`?=`みたいなやつ)

> [!IMPORTANT] 
> `ForceExecution`を`true`にすると、ユーザーはその機能のオンオフを選択できず、強制的にその機能をオンにすることができます。
> `initialState`を`false`にすると、初期状態で機能が無効化した状態になります。

### 開発ブランチにマージ

機能が完成し、develop ブランチにマージする際は**プルリクエスト**を作成してください。  
**main ブランチには基本的にマージしないでください。**

もしもプルリクエストの承認に時間がかかっている場合は連絡してください。

## contents_scripts/ fun

ちょっとした遊び心です。隠し機能みたいな？  
どんどん追加してもらってかまわないぜ。

# バージョン

## v1.0

リリースだぜ

### v1.0.1

「カード」「リスト」「概要」の 3 つのコースの表示形式に対応。また表示形式を切り替えた場合でも時間割追加ボタンを追加。

### v1.0.2

コースの種類を選ぶプルダウンを押したときに、各コースに「時間割を追加」ボタンが無限に増え続けるバグを修正。  
コースの表示形式の変更以外のコースの再生成時に「時間割を生成ボタンを追加。」

## 1.1

残り時間表示機能追加

### 1.1.1

日付の桁数によるバグ修

### 1.2.0

簡易メモ機能を実装  
機能選択を可能に

### 1.2.1

時間割追加画面に時間割が複数表示されるバグを修正 (協力：けいたん)  
機能選択が効かないバグを修正 (協力：けいたん)

# 開発者

### Harukomugi (はるこむぎ)
### けいたん

# 参加

Discord のサーバーリンク : https://discord.gg/A8P3VnXbM9
