const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs'); // Node.jsのファイルシステムモジュールを使用してディレクトリやファイルを操作

const packageJson = require('./package.json');
console.log('packageJson', packageJson);

// バージョン情報が書いてあるjsonファイルを読み込む
const versionInfo = require('./content_scripts/update_announcer/version_info.json');

// ====================================================================
// ★ここからエントリポイントとmanifest.jsonのcontent_scriptsを自動生成するロジック★
// ====================================================================

// content_scripts ディレクトリの絶対パスを解決
const contentScriptsPath = path.resolve(__dirname, 'content_scripts');
// Webpackのエントリポイントを格納するオブジェクト
const entryPoints = {};
// manifest.jsonのcontent_scripts配列に渡すデータを格納する配列
let contentScriptManifestEntries = []; // 初期値を空の配列で宣言（letを使用）

try {
  // content_scripts ディレクトリ内の全エントリ（ファイルとディレクトリ）を読み込む
  // { withFileTypes: true } で fs.Dirent オブジェクトとして取得し、種類を判別可能にする
  const featureFolders = fs.readdirSync(contentScriptsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory()) // ディレクトリのみをフィルタリング（各機能のフォルダ）
    .map(dirent => dirent.name); // ディレクトリ名（例: 'course_timetable', 'add_time_limit'）を取得

  // 各機能フォルダに対して処理を実行
  featureFolders.forEach(folderName => {
    // 各機能のエントリポイントを探す (content.ts を優先)
    const tsEntryPath = path.join(contentScriptsPath, folderName, 'content.ts');
    const jsEntryPath = path.join(contentScriptsPath, folderName, 'content.js');
    let entryFilePath = '';

    if (fs.existsSync(tsEntryPath)) {
      entryFilePath = tsEntryPath;
    } else if (fs.existsSync(jsEntryPath)) {
      entryFilePath = jsEntryPath;
    }
    
    // 各機能の設定が記述された config.json ファイルのパスを構築
    const configFilePath = path.join(contentScriptsPath, folderName, 'config.json');

    // エントリファイルが存在するか確認
    if (entryFilePath) {
      // Webpackのエントリポイントとして追加
      // 例: { 'course_timetable': 'C:/.../content_scripts/course_timetable/content.ts' }
      entryPoints[folderName] = entryFilePath;

      // config.json ファイルが存在するか確認
      if (fs.existsSync(configFilePath)) {
        try {
          // config.json を読み込み、JSONとしてパースする
          const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

          // config.json に matches プロパティがあり、それが配列であることを確認
          if (config.matches && Array.isArray(config.matches)) {
            // manifest.json の content_scripts 部分に記述するエントリを作成
            const manifestEntry = {
              matches: config.matches,
              js: [`js/${folderName}.bundle.js`] // Webpackが出力するJSバンドルのパスに合わせる
            };
            // もしconfig.jsonにCSSが定義されており、それが配列で空でない場合
            if (config.css && Array.isArray(config.css) && config.css.length > 0) {
              // CSSファイルのパスをマップして追加
              manifestEntry.css = config.css.map(cssFile => `css/${folderName}/${cssFile}`);
              // 重要: 現在のWebpack設定（style-loader, css-loader）ではCSSはJSにバンドルされます。
              // そのため、manifest.jsonにCSSファイルを別途記述する必要は通常ありません。
              // もしmanifest.jsonにCSSを記述し、独立したCSSファイルとして出力したい場合は、
              // MiniCssExtractPlugin の導入と、CopyWebpackPlugin でのCSSファイルのコピー設定も追加で必要になります。
              // このコメントアウトされた行は、独立したCSSファイルを扱う場合のプレースホルダーです。
            }
            // 生成したmanifestエントリを配列に追加
            contentScriptManifestEntries.push(manifestEntry);
          } else {
            // matches プロパティが不正な場合の警告
            console.warn(`警告: ${configFilePath} に 'matches' 配列が見つからないか無効です。`);
          }
        } catch (parseError) {
          // config.json のJSONパースエラーが発生した場合の処理
          console.error(`エラー: ${configFilePath} のパースに失敗しました: ${parseError.message}`);
        }
      } else {
        // config.json が見つからない場合の警告
        console.warn(`警告: ${folderName} ディレクトリ内に config.json が見つかりませんでした。content_scriptsエントリは生成されません。`);
      }
    } else {
      // content.js または content.ts が見つからない場合の警告
      console.warn(`警告: ${folderName} ディレクトリ内に content.js または content.ts が見つかりませんでした。エントリポイントは生成されません。`);
    }
  });
} catch (error) {
  // content_scripts ディレクトリの読み込み自体（fs.readdirSyncなど）でエラーが発生した場合
  console.error(`content_scripts ディレクトリの読み込み中にエラーが発生しました: ${error.message}`);
  // このエラーが発生した場合、contentScriptManifestEntries は初期値（空の配列 []）のままとなるため、
  // Webpackのビルドはクラッシュせずに続行されます。必要であればここで `process.exit(1);` を呼び出してビルドを中断できます。
}
// ====================================================================
// ★ここまでエントリポイントとmanifest.jsonのcontent_scriptsの自動生成ロジック★
// ====================================================================


module.exports = {
  // ビルドモードを設定:
  // 'development' は開発用 (デバッグしやすい、ソースマップ生成)
  // 'production' は本番用 (コード圧縮、最適化)
  mode: 'development',

  // エントリポイント: Webpackがビルドを開始するJavaScriptファイル
  // 各エントリポイントは、独自のバンドルファイルとして出力されます。
  // ここでは、content_scripts ディレクトリ内の各機能の content.js をエントリポイントとして自動で設定
  entry: entryPoints, // 自動生成された `entryPoints` オブジェクトを使用

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
      // TypeScriptの処理
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
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
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'], // .ts, .tsx, .js, .jsx, .json の拡張子を解決対象とする
  },

  // プラグイン: ビルドプロセスにカスタム機能を追加
  plugins: [
    // 出力ディレクトリ（dist）をビルド前にクリーンアップするプラグイン
    new CleanWebpackPlugin(),

    // manifest.json をテンプレートから生成する HtmlWebpackPlugin の設定
    new HtmlWebpackPlugin({
      filename: 'manifest.json', // 出力ファイル名 (dist/manifest.json)
      template: './manifest.json.ejs', // 使用するEJSテンプレートファイル
      inject: false, // HTMLにJS/CSSを自動注入しない (manifest.json なので不要)
      templateParameters: {
        // EJSテンプレートに渡すデータ
        packageName: packageJson.name,
        packageVersion: packageJson.version,
        packageDescription: packageJson.description,
        contentScripts: contentScriptManifestEntries, // ★修正: タイプミスを修正 `contentScripts`
      },
      minify: false,
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
        // 例: { from: 'content_scripts/course_timetable/content.css', to: 'content_scripts/course_timetable/content.css' },
        // 上記のように個別に指定するか、fs.readdirSync などで動的にパターンを生成する必要がある
      ],
    }),

    // ビルド時に各機能ファイルに自身の機能名を置換して挿入
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('InjectFeatureKey', (compilation) => {
          Object.keys(entryPoints).forEach(featureName => {
            const bundleFilename = `js/${featureName}.bundle.js`;
            const bundlePath = path.join(compilation.outputOptions.path, bundleFilename);

            if (fs.existsSync(bundlePath)) {
              let bundleContent = fs.readFileSync(bundlePath, 'utf8');
              if (bundleContent.includes('__FEATURE_KEY_PLACEHOLDER__')) {
                // 機能名を置換
                const featureKey = `${featureName}`;
                // プレースホルダー文字列自体を直接置換する
                // 最小化後も "__FEATURE_KEY_PLACEHOLDER__" という文字列は保持されるため、
                // 変数名に依存せずに置換できる
                bundleContent = bundleContent.replace(/__FEATURE_KEY_PLACEHOLDER__/g, featureKey);
                console.log(`✅ ${bundleFilename} に FEATURE_KEY を注入しました: ${featureKey}`);
              }

              if (bundleContent.includes('__CURRENT_VERSION_PLACEHOLDER__')) {
                // 現在のバージョンを置換
                const CurrentVersion = packageJson.version;
                // 最小化後も "__CURRENT_VERSION_PLACEHOLDER__" という文字列は保持されるため、
                // 変数名に依存せずに置換できる
                bundleContent = bundleContent.replace(/__CURRENT_VERSION_PLACEHOLDER__/g, CurrentVersion);
                fs.writeFileSync(bundlePath, bundleContent, 'utf8');
                console.log(`✅ ${bundleFilename} に CURRENT_VERSION を注入しました: ${CurrentVersion}`);
              }
            }
          });
        });
      },
    },

    // ビルド完了後に機能一覧JSONを生成するプラグイン
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('GenerateFeatureKeysJson', (compilation) => {
          // featureFolders変数から、機能名（キー）のリストを取得する
          const featureKeys = fs.readdirSync(contentScriptsPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

          const features = featureKeys.map(key => {
            const configFilePath = path.join(contentScriptsPath, key, 'config.json');
            let displayName = key; // デフォルトはフォルダ名
            let description = ''; // デフォルトは空
            let ForceExecution = false; // デフォルトはfalse
            let initialState = true; // デフォルトはtrue

            if (fs.existsSync(configFilePath)) {
              try {
                const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
                // config.jsonにdisplayNameがあればそれを使う
                if (config.displayName) {
                  displayName = config.displayName;
                }
                // config.jsonにdescriptionがあればそれを使う
                if (config.description) {
                  description = config.description;
                }
                // config.jsonのForceExecutionがtrueならばそれを使う
                if (config.ForceExecution === true) {
                  ForceExecution = config.ForceExecution;
                }
                // config.jsonのinitialStateがfalseならばそれを使う
                if (config.initialState === false) {
                  initialState = config.initialState;
                }
              } catch (e) {
                console.error(`エラー: ${configFilePath} のパースに失敗しました: ${e.message}`);
              }
            }
            return {
              key: key,
              displayName: displayName,
              description: description,
              ForceExecution: ForceExecution,
              initialState: initialState
            };
          });

          const jsonData = {
            features: features,
          };
          const jsonString = JSON.stringify(jsonData, null, 2);

          // 出力パスを設定
          const outputPath = compilation.outputOptions.path;
          const jsonFilePath = path.join(outputPath, 'features.json');

          // JSONファイルを dist ディレクトリに出力
          fs.writeFileSync(jsonFilePath, jsonString);
          console.log(`\n✅ ${jsonFilePath} を生成しました。`);
        });
      },
    },
  ],

  
  // 開発ツール: ソースマップの生成など、デバッグを助ける設定
  // 開発中は 'cheap-module-source-map' が推奨されます (ビルド速度とデバッグのしやすさのバランスが良い)
  // 本番ビルドでは通常 'source-map' (精度は最高だがビルドが遅い) または無効化 (本番環境ではソースコードを公開しないため)
  devtool: 'cheap-module-source-map',
};

// バージョン情報の最新バージョンとpackage.jsonのバージョンを比較して警告を出す設定
if (versionInfo[0].version !== packageJson.version) {
  console.warn(`⚠️ 警告: package.json のバージョン (${packageJson.version}) と version_info.json の最新バージョン (${versionInfo[0].version}) が一致しません。`);
  console.warn(`  両方のバージョンを一致させることを推奨します。\n`);
}