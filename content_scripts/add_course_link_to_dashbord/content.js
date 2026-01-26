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

import "./content.css";
import { getCourseLink } from "./get_courseLink.js";
import { editDomToAddCourseLink } from "./edit_dom.js";
import { maintainCacheSizeLimit } from "./operate_storage_local.js";


// ブラウザ読み込み時にメイン関数を実行。
async function main(){
    // キャッシュサイズ制限を維持
    maintainCacheSizeLimit();
    // DOM編集関数を実行
    editDomToAddCourseLink();
}