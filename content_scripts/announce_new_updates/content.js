import update_info from './update_info.json' assert { type: 'json' };

// 現在のバージョンを取得
const currentVersion = "__CURRENT_VERSION__"; // ビルド時に置換される

// ローカルストレージから前回のバージョンを取得
const previousVersion = "";