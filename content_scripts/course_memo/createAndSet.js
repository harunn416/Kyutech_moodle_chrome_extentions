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
    * div
    *   div
    *     トグル
    *     page
    *   div
    *   メモ欄
    * div
    */

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

    
    // コース一覧とメモトグルをいれるコンテナ
    const newWrapperToggle = document.createElement('div');
    newWrapperToggle.style.flexGrow = '1';
    
    // ラッピングするターゲット要素
    const targetElement = document.querySelector('div#page');
    
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
    newWrapperMemo.style.display = 'flex';

    // ターゲット要素の親要素を取得
    const parentElementToggle = newWrapperToggle.parentNode;
    
    // 4. 新しい親要素を、元の要素の位置に挿入する
    // (ここでは、元の親要素に対して、新しいラッパーを挿入します)
    parentElementToggle.insertBefore(newWrapperMemo, newWrapperToggle);

    // ターゲット要素を新しいラッパーに移動
    newWrapperMemo.appendChild(newWrapperToggle);

    // ターゲット要素を横いっぱいに広げる
    targetElement.style.flexGrow = '1';

    // メモ欄を新しいラッパーに追加
    newWrapperMemo.appendChild(sideMemoBar);
}