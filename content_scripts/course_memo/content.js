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

// cssをインポート
import './content.css';

// MutationObserverを使った要素出現監視関数をインポート
const { observeElementAppearance } = require('../../util/mutationObserver.js');

// ブラウザ読み込み時にメイン関数を実行。
function main(){
    console.log(`機能(${FEATURE_KEY})を実行します。`);
    observeElementAppearance('div#page', showFeatureSettingsPopup, document.body, true);
    observeElementAppearance('div#page', addToggleElement, document.body, true);
}

/** メモ欄を出すトグルを生成し、挿入する関数
 * @returns {HTMLDivElement} 生成したトグルのdiv要素
 */
function addToggleElement() {
    // トグルの親要素
    const togglerDiv = document.createElement('div');
    togglerDiv.id = 'memo-icon';

    // 画像のURLを拡張機能のAPIから取得
    const iconUrl = chrome.runtime.getURL('assets/course_memo/memo_icon.png');
    
    // スタイルを設定
    togglerDiv.style.backgroundImage = `url(${iconUrl})`;
    togglerDiv.style.backgroundColor = '#d4d4d4'; // 通常時の背景色

    // ホバーイベント
    togglerDiv.addEventListener('mouseover', () => {
        togglerDiv.style.backgroundColor = '#a6a6a6'; // ホバー時の背景色
        togglerDiv.style.width = '55px';
    });

    togglerDiv.addEventListener('mouseout', () => {
        togglerDiv.style.backgroundColor = '#d4d4d4'; // 通常時の背景色
        togglerDiv.style.width = '50px';
    });

    // トグルを挿入する要素
    const targetElement = document.querySelector('div#page');
    targetElement.prepend(togglerDiv);
}


/** メモ欄を表示する関数 */
function showFeatureSettingsPopup() {
    // 既にポップアップが存在する場合はなにもしない　(後で実装)

    // メモ欄要素の作成
    const sideMemoBar = document.createElement('div');
    sideMemoBar.id = 'course-memo-sidebar';
    sideMemoBar.style.width = '0';
    sideMemoBar.style.height = '100%';
    sideMemoBar.style.backgroundColor = '#f9f9f9';
    sideMemoBar.style.padding = '0';
    sideMemoBar.style.marginTop = '60px';
    sideMemoBar.style.zIndex = '2';

    // メモ欄とコース一覧を横並びにするためのコンテナ
    const newWrapper = document.createElement('div');
    newWrapper.style.display = 'flex';

    // ラッピングするターゲット要素
    const targetElement = document.querySelector('div#page');

    // ターゲット要素の親要素を取得
    const parentElement = targetElement.parentNode;

    // 4. 新しい親要素を、元の要素の位置に挿入する
    // (ここでは、元の親要素に対して、新しいラッパーを挿入します)
    parentElement.insertBefore(newWrapper, targetElement);
    
    // ターゲット要素を新しいラッパーに移動
    newWrapper.appendChild(targetElement);

    // ターゲット要素を横いっぱいに広げる
    targetElement.style.flexGrow = '1';

    // メモ欄を新しいラッパーに追加
    newWrapper.appendChild(sideMemoBar);
}

/** メモ欄を開らく関数 */
function hideFeatureSettingsPopup() {
    const sideMemoBar = document.getElementById('course-memo-sidebar');
    if (sideMemoBar.style.width === '0px' || sideMemoBar.style.width === '0') {
        sideMemoBar.style.width = '300px'; // メモ欄を開く
        sideMemoBar.style.padding = '10px';
    }
}

/** メモ欄を閉じる関数 */
function closeFeatureSettingsPopup() {
    const sideMemoBar = document.getElementById('course-memo-sidebar');
    if (sideMemoBar.style.width !== '0px' || sideMemoBar.style.width !== '0') {
        sideMemoBar.style.width = '0'; // メモ欄を閉じる
        sideMemoBar.style.padding = '0';
    }
}