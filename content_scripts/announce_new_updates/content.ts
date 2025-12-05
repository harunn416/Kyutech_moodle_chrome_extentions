import update_info from './update_info.json';

// 1. 各バージョン情報オブジェクトの型
interface VersionInfo {
    // version は文字列型
    version: string;
    // update_content は文字列の配列型
    update_content: string[];
}

// 2. インポートされるデータ全体の型
// JSON全体は VersionInfo オブジェクトの配列である
type UpdateInfo = VersionInfo[];

// 3. インポートした変数に型をキャスト（適用）する
// as を使って型を適用することで、update_info が UpdateInfo 型として扱われる
const infoList = update_info as UpdateInfo;

// 現在のバージョンを取得
const currentVersion = "__CURRENT_VERSION_PLACEHOLDER__"; // ビルド時に置換される

console.log("Current Version:", currentVersion);
console.log("Update Info:", infoList);

// 副作用を持つコードを追加して、コンパイラが出力を省略しないようにする
document.addEventListener('DOMContentLoaded', () => {
    console.log('Kyutech Moodle Chrome Extension: Announce new updates script loaded.');
    const body = document.querySelector('body');
    if (body) {
        const newDiv = document.createElement('div');
        newDiv.style.display = 'none';
        newDiv.id = 'extension-update-info';
        newDiv.dataset.version = currentVersion;
        body.appendChild(newDiv);
    }
});

