const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs'); // Node.jsのファイルシステムモジュールを使用してディレクトリやファイルを操作

const packageJson = require('./package.json');
console.log('packageJson', packageJson);

// ★ここからentryポイントの自動生成ロジックを追加★
const contentScriptsPath = path.resolve(__dirname, 'content_scripts');
const entryPoints = {};
let contentScriptManifestEntries = [];

try {
    // content_scripts ディレクトリ内のサブディレクトリを読み込む
    const featureFolders = fs.readdirSync(contentScriptsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory()) // ディレクトリのみをフィルタリング
        .map(dirent => dirent.name); // ディレクトリ名（機能名）を取得

    featureFolders.forEach(folderName => {
        const entryFilePath = path.join(contentScriptsPath, folderName, 'content.js');
        // content.js ファイルが存在するか確認
        if (fs.existsSync(entryFilePath)) {
            // config.jsonを読み込み、manifest.jsonのcontent_scriptsエントリを生成
            if (fs.existsSync(configFilePath)) {
                try {
                    const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

                    if (config.matches && Array.isArray(config.matches)) {
                        const manifestEntry = {
                            matches: config.matches,
                            js: [`js/${folderName}.bundle.js`] // Webpackの出力パスに合わせる
                        };
                        // もしconfig.jsonにCSSが定義されていれば追加
                        if (config.css && Array.isArray(config.css) && config.css.length > 0) {
                           manifestEntry.css = config.css.map(cssFile => `css/${folderName}/${cssFile}`);
                           // 必要であれば、ここでCopyWebpackPluginに追加のパターンも生成できます
                           // 現状のCSSローダーでJSに埋め込んでいるなら、別途コピーは不要です
                           // もしcontent.jsのCSSをmanifest.jsonに独立して記述するなら、
                           // そのCSSファイルをdist/css/機能名/ファイル名.cssにコピーする設定をCopyWebpackPluginに追加する必要があります。
                           // 現状のCSSローダー（style-loader, css-loader）であれば、CSSはJSバンドルに含まれるため、
                           // manifestEntry.css の行は不要または別の処理が必要です。
                           // ここでは一旦、独立したCSSファイルがある場合のプレースホルダーとして残しておきます。
                           // (JSにCSSをバンドルしている場合は、manifest.jsonにCSSは記述しません)
                        }
                        contentScriptManifestEntries.push(manifestEntry);
                    } else {
                        console.warn(`警告: ${configFilePath} に 'matches' 配列が見つからないか無効です。`);
                    }
                } catch (parseError) {
                    console.error(`エラー: ${configFilePath} のパースに失敗しました: ${parseError.message}`);
                }
            } else {
                console.warn(`警告: ${folderName} ディレクトリ内に config.json が見つかりませんでした。content_scriptsエントリは生成されません。`);
            }
            entryPoints[folderName] = entryFilePath;
        } else {
            console.warn(`警告: ${folderName} ディレクトリ内に content.js が見つかりませんでした。`);
        }
    });
} catch (error) {
    console.error(`content_scripts ディレクトリの読み込み中にエラーが発生しました: ${error.message}`);
    // エラーが発生した場合でも、空のentryオブジェクトでWebpackが起動できるようにする
    // または、ここで process.exit(1) などでビルドを中断することも検討
}
// ★ここまでentryポイントの自動生成ロジック★

module.exports = {
  // ビルドモードを設定:
  // 'development' は開発用 (デバッグしやすい、ソースマップ生成)
  // 'production' は本番用 (コード圧縮、最適化)
  mode: 'development',

  // エントリポイント: Webpackがビルドを開始するJavaScriptファイル
  // 各エントリポイントは、独自のバンドルファイルとして出力されます。
  // ここでは、content_scripts ディレクトリ内の各機能の content.js をエントリポイントとして自動で設定
  entry: entryPoints,

  // 出力設定: バンドルされたファイルをどこに出力するか
  output: {
    // 出力ディレクトリのパス: プロジェクトルートの 'dist' フォルダ
    // `path.resolve(__dirname, 'dist')` は、webpack.config.js があるディレクトリの絶対パスに 'dist' を結合します
    path: path.resolve(__dirname, 'dist'),

    // 出力ファイル名:
    // `[name]` は `entry` で指定したキー名 (例: 'course_timetable' -> 'course_timetable.bundle.js')
    // `[contenthash]` はファイル内容のハッシュ (キャッシュ busting に便利ですが、開発中はシンプルに)
    //jsファイルは 'js' フォルダに出力されます
    // 例: 'js/course_timetable.bundle.js'
    filename: 'js/[name].bundle.js',

    // アセット（画像など）の出力先ディレクトリ（オプション）
    // assetModuleFilename: 'assets/[name][ext][query]',
  },

  // モジュール（ローダー）の設定:
  // WebpackがJavaScript以外のファイルタイプ（CSS、画像など）をどう処理するかを定義します。
  module: {
    rules: [
      // CSSファイルの処理:
      // JavaScriptファイル内で `import './style.css';` のようにCSSをインポートできるようにします。
      {
        test: /\.css$/, // .css で終わるファイルを対象
        use: ['style-loader', 'css-loader'], // style-loader, css-loader の順で適用
        // style-loader: JSにCSSを注入してHTMLの<style>タグとして適用
        // css-loader: CSSファイルをJSモジュールに変換
      },
      // もし Sass/SCSS を使うなら、`sass-loader` と `node-sass` または `sass` も必要
      // {
      //   test: /\.s[ac]ss$/i,
      //   use: ['style-loader', 'css-loader', 'sass-loader'],
      // },

      // 画像やフォントなどのアセットファイルの処理 (Webpack 5 の組み込み機能)
      // JSからimportした場合、またはCSSから参照された場合にdistにコピー
      {
        test: /\.(png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource', // ファイルをdistディレクトリにコピーする
        generator: {
          filename: 'assets/[name][ext][query]', // 出力パスとファイル名形式
        },
      },

      // JavaScriptのトランスパイル (例: Babelを使用する場合)
      // ES6+ の新しいJS構文を古いブラウザでも動くように変換する
      // `npm install --save-dev babel-loader @babel/core @babel/preset-env` が必要
      // {
      //   test: /\.js$/,
      //   exclude: /node_modules/, // node_modules 以下のファイルは対象外
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       presets: ['@babel/preset-env'], // 最新のJSをES5に変換
      //     },
      //   },
      // },
    ],
  },

  // モジュールの解決方法:
  // `import` 文でファイル拡張子を省略できるようにします。
  resolve: {
    extensions: ['.js', '.jsx', '.json'], // .js, .jsx, .json の拡張子を解決対象とする
  },

  // プラグイン: ビルドプロセスにカスタム機能を追加
  plugins: [
    // 出力ディレクトリ（dist）をビルド前にクリーンアップするプラグイン
    new CleanWebpackPlugin(),

    // manifest.json をテンプレートから生成する HtmlWebpackPlugin の設定
    new HtmlWebpackPlugin({
      filename: 'manifest.json', // 出力ファイル名 (dist/manifest.json)
      template: './manifest.json.ejs', // 使用するテンプレートファイル
      inject: false, // HTMLにJS/CSSを自動注入しない (manifest.json なので不要)
      templateParameters: {
        // オブジェクトとして渡す (例: `data` という名前で)
        // テンプレートでは `data.packageName` のように参照する
        packageName: packageJson.name,
        packageVersion: packageJson.version,
        packageDescription: packageJson.description,
        ontentScripts: contentScriptManifestEntries, // content_scriptsデータをテンプレートに渡す
      },
    }),

    // `manifest.json` やその他の静的ファイルを `dist` フォルダにコピーする
    new CopyWebpackPlugin({
      patterns: [
        // popup.html が存在するならコピー (例)
        // { from: 'popup.html', to: 'popup.html' },

        // assets フォルダ全体を dist/assets にコピー (例: アイコンなど)
        // プロジェクトルートに 'assets' フォルダがある場合
        { from: 'assets', to: 'assets' },

        // もしCSSをJSから import せずに、manifest.json で直接指定する場合は、ここで個別にコピー
        // { from: 'content_scripts/course_timetable/content.css', to: 'content_scripts/course_timetable/content.css' },
        // { from: 'content_scripts/fun/fun.css', to: 'content_scripts/fun/fun.css' },
      ],
    }),
  ],

  // 開発ツール: ソースマップの生成など、デバッグを助ける設定
  // 開発中は 'cheap-module-source-map' が推奨されます
  // 本番ビルドでは通常 'source-map' (精度は最高だがビルド遅い) または無効化
  devtool: 'cheap-module-source-map',
};