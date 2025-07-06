const path = require('path');

module.exports = {
  mode: 'development',
  entry: './content_scripts/course_timetable/content.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        type: "javascript/auto",
      },
    ],
  },
  devtool: 'source-map', // ソースマップを出力
};