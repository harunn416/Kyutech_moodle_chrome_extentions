/** メモ欄を出すトグルを生成し、挿入する関数
 * @returns {HTMLDivElement} 生成したトグルのdiv要素
 */
const createToggleElement = () => {
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

    // 仮の要素
    togglerDiv.appendChild(document.createElement('span'));

    // クリックイベント
    togglerDiv.addEventListener('click', openHideFeatureSettingsPopup);

    // トグルを挿入する要素
    // const targetElement = document.querySelector('div#page');
    // targetElement.prepend(togglerDiv);
    return togglerDiv;
}


/** メモ欄を表示する関数 */
module.exports.showFeatureSettingsPopup = () => {
    /* page要素をトグルとラッピングして、そのラッピング要素とメモ欄をさらにラッピングする
    * もともとの構造
    * page
    * 
    * 改良後の構造
    * div #course-memo-wrapper
    *   div #course-memo-toggle-wrapper
    *     トグル
    *     page
    *   div
    *   セパレーター #course-memo-separator
    *   メモ欄 #course-memo-sidebar
    * div
    */

    // メモ欄要素の作成
    const sideMemoBar = document.createElement('div');
    sideMemoBar.id = 'course-memo-sidebar';
    sideMemoBar.style.display = 'none'; // 初期状態では非表示
    sideMemoBar.style.width = '300px';
    sideMemoBar.style.height = 'calc(100% - 60px)'; // ヘッダーの高さを引く
    sideMemoBar.style.backgroundColor = '#f9f9f9';
    sideMemoBar.style.padding = '0';
    sideMemoBar.style.marginTop = '60px';
    sideMemoBar.style.zIndex = '2';


    // コース一覧とメモトグルをいれるコンテナ
    const newWrapperToggle = document.createElement('div');
    newWrapperToggle.style.flexGrow = '1';

    // ラッピングするターゲット要素
    const targetElement = document.querySelector('div#page');

    // ターゲット要素を横いっぱいに広げる
    targetElement.style.flexGrow = '1';

    // ターゲット要素の親要素を取得
    const parentElementPage = targetElement.parentNode;

    // 4. 新しい親要素を、元の要素の位置に挿入する
    // (ここでは、元の親要素に対して、新しいラッパーを挿入します)
    parentElementPage.insertBefore(newWrapperToggle, targetElement);

    // トグル要素を作成して追加
    const toggleElement = createToggleElement();
    newWrapperToggle.prepend(toggleElement);

    // 5. 元の要素を新しい親要素に移動する
    newWrapperToggle.appendChild(targetElement);



    // メモ欄と"コース一覧とメモトグル"を横並びにするためのコンテナ
    const newWrapperMemo = document.createElement('div');
    newWrapperMemo.id = 'course-memo-wrapper';
    newWrapperMemo.style.display = 'flex';

    // ターゲット要素の親要素を取得
    const parentElementToggle = newWrapperToggle.parentNode;

    // 4. 新しい親要素を、元の要素の位置に挿入する
    // (ここでは、元の親要素に対して、新しいラッパーを挿入します)
    parentElementToggle.insertBefore(newWrapperMemo, newWrapperToggle);

    // ターゲット要素を新しいラッパーに移動
    newWrapperMemo.appendChild(newWrapperToggle);

    // セパレーターを作成して追加
    const separator = document.createElement('div');
    separator.id = 'course-memo-separator';
    newWrapperMemo.appendChild(separator);

    // メモ欄を新しいラッパーに追加
    newWrapperMemo.appendChild(sideMemoBar);
}

/** メモ欄を開閉する関数 */
function openHideFeatureSettingsPopup() {
    const sideMemoBar = document.querySelector('#course-memo-sidebar');
    const separator = document.querySelector('#course-memo-separator');
    if (sideMemoBar.style.display == 'none') {
        sideMemoBar.style.display = 'block';
        sideMemoBar.style.width = '300px'; // メモ欄を開く
        separator.style.display = 'block'; // セパレーターを表示
    } else {
        sideMemoBar.style.display = 'none'; // メモ欄を閉じる
        separator.style.display = 'none'; // セパレーターを非表示
    }
}

