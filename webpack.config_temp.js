const path = require('path');
//const CopyWebpackPlugin = require('copy-webpack-plugin'); // 後でmanifest.jsonなどをコピーするのに使うプラグイン

module.exports = {
  // 開発モードと本番モードを選択（開発時は'development'、最終ビルド時は'production'）
  mode: 'development',

  // エントリポイント: Webpackがビルドを開始する起点となるファイル
  entry: {
    'course-timetable': './content_scripts/course_timetable/content.js',
    'course-timetable': './content_scripts/course_timetable/timetableAddPopup.js',
    'course-timetable': './content_scripts/course_timetable/timetableEditPopup.js',
  },

  // 出力設定: バンドルされたファイルをどこに出力するか
  output: {
    // 出力ディレクトリのパス (例: プロジェクトルートの'dist'フォルダ)
    path: path.join(__dirname, 'dist'),
    // 出力ファイル名 ([name]はentryのキー名、例: background.bundle.js)
    filename: '[name].bundle.js',
  },

  // モジュール解決: どの拡張子のファイルを解決するか
  /*resolve: {
    extensions: ['.js', '.jsx', '.json'], // .jsファイルや.jsxファイルを解決対象とする
  },
  module: {
    rules: [
      {
        test: /\.css$/, // .cssで終わるファイルを対象にする
        use: ['style-loader', 'css-loader'], // style-loader, css-loaderの順で適用
      },
    ],
  },*/

  /*/ プラグイン: ビルドプロセスに追加機能を提供する
  plugins: [
    // manifest.jsonやHTML、CSS、アセットなどをdistフォルダにコピーする
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        // popup.htmlやpopup.cssが存在する場合のみ追加してください
        // { from: 'popup.html', to: 'popup.html' },
        // { from: 'popup.css', to: 'popup.css' },
        { from: 'assets', to: 'assets' },
        // content_scripts配下のCSSをすべてコピー
        { from: 'content_scripts/course_timetable/content.css', to: 'content_scripts/course_timetable/content.css' },
        // 必要に応じて他のCSSも追加
      ],
    }),
  ],

  // 開発ツール: ソースマップの生成など、デバッグを助ける設定
  devtool: 'cheap-module-source-map', // デバッグしやすいソースマップを生成
  */
};