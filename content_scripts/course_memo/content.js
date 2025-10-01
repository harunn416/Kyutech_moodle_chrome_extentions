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

// MutationObserverを使った要素出現監視関数をインポート
const { observeElementAppearance } = require('../../util/mutationObserver.js');

console.log('Course Memo content script loaded.');
// ブラウザ読み込み時にメイン関数を実行。
function main(){
    addMemoToggle();
}

/** ポップアップを出すトグルを生成する関数
 * @returns {HTMLDivElement} 生成したトグルのdiv要素
 */
function createDrawerTogglerElement() {
    // メインの <div> 要素の生成
    const divToggler = document.createElement('div');
    divToggler.className = 'drawer-toggler drawer-right-toggle ml-auto d-print-none';
    // style属性の設定
    divToggler.style.cssText = '\n    top: calc(60px + 5.7rem);\n';

    // <button> 要素の生成
    const button = document.createElement('button');
    button.className = 'btn icon-no-margin';
    button.setAttribute('data-toggler', 'drawers');
    button.setAttribute('data-action', 'toggle');
    button.setAttribute('data-target', 'theme_boost-drawers-blocks');
    button.setAttribute('data-toggle', 'tooltip');
    button.setAttribute('data-placement', 'right');
    button.setAttribute('data-original-title', 'メモを開く');
    button.setAttribute('data-lastused', 'true');

    // 最初の <span> 要素（sr-only）の生成
    const spanSrOnly = document.createElement('span');
    spanSrOnly.className = 'sr-only';
    spanSrOnly.textContent = 'メモを開く'; // テキストノードを設定

    // 2番目の <span> 要素（dir-rtl-hide）の生成
    const spanDirRtlHide = document.createElement('span');
    spanDirRtlHide.className = 'dir-rtl-hide';

    // <i> 要素（chevron-left）の生成
    const iconLeft = document.createElement('i');
    iconLeft.className = 'icon fa fa-chevron-left fa-fw ';
    iconLeft.setAttribute('aria-hidden', 'true');

    // <i> 要素を <span>（dir-rtl-hide）に追加
    spanDirRtlHide.appendChild(iconLeft);

    // 3番目の <span> 要素（dir-ltr-hide）の生成
    const spanDirLtrHide = document.createElement('span');
    spanDirLtrHide.className = 'dir-ltr-hide';

    // 2番目の <i> 要素（chevron-right）の生成
    const iconRight = document.createElement('i');
    iconRight.className = 'icon fa fa-chevron-right fa-fw ';
    iconRight.setAttribute('aria-hidden', 'true');

    // 2番目の <i> 要素を <span>（dir-ltr-hide）に追加
    spanDirLtrHide.appendChild(iconRight);

    // 全ての <span> 要素を <button> に追加
    button.appendChild(spanSrOnly);
    button.appendChild(spanDirRtlHide);
    button.appendChild(spanDirLtrHide);

    // <button> 要素をメインの <div> に追加
    divToggler.appendChild(button);

    // 完成した要素を返す
    return divToggler;
}

/** トグルを生成し、特定の要素に追加する関数 */
function addMemoToggle() {
    // ターゲットセレクタ
    const targetSelector = '#topofscroll';
    observeElementAppearance(targetSelector, (targetElement) => {
        // トグル要素を生成
        const togglerElement = createDrawerTogglerElement();
        // ターゲット要素の指定した部分にトグル要素を追加
        targetElement.querySelector('div.drawer-toggles.d-flex').appendChild(togglerElement);
        console.log('メモトグルを追加しました。');
    }, document.body, true);

}
