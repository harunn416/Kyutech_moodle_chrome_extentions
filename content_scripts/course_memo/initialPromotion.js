// ポップアップを表示するかどうかを判断するキー
const POPUP_FLAG_KEY = 'course_memo_v1';

/** 新機能(コースメモ)を宣伝するポップアップを生成する関数 */
function initiatePopupPromotion() {
    // 背景を暗くするオーバーレイを作成
    const overlay = document.createElement('div');
    overlay.id = 'firstViewOverlay_kyutech';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '10000';

    // オーバーレイクリックでポップアップを閉じる
    overlay.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    // ポップアップコンテナを作成
    const popup = document.createElement('div');
    popup.id = 'firstViewPopup_kyutech';
    popup.style.position = 'fixed';
    popup.style.top = '20%';
    popup.style.right = '100px';
    popup.style.width = '500px';
    popup.style.transform = 'translateY(-50%)';
    popup.style.backgroundColor = '#fff';
    popup.style.border = '2px solid #000';
    popup.style.borderRadius = '10px';
    popup.style.padding = '20px';
    popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    popup.style.zIndex = '10001';
    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popup.style.justifyContent = 'space-between';

    // ポップアップ内容を追加
    const title = document.createElement('h2');
    title.innerText = '新機能: コースメモ !!';
    title.style.margin = '0 0 15px 0';
    popup.appendChild(title);

    // 説明文1
    const description_1 = document.createElement('p');
    description_1.innerText = '各コースごとに簡易的なメモを残すことができます。\n（メモは異なる端末では同期できません。「エクスポート・インポート」を活用してください）';
    description_1.style.flexGrow = '1';
    popup.appendChild(description_1);

    // 説明文2
    const description_2 = document.createElement('p');
    description_2.innerText = 'メモ欄は、画面右側の「ノート」アイコンをクリックして表示できます。';
    description_2.style.flexGrow = '1';
    popup.appendChild(description_2);

    // 最後の文言
    const note = document.createElement('p');
    note.innerText = '早速試してみよう！    👉';
    note.style.fontSize = '30px';
    note.style.color = '#ff8080ff';
    note.style.margin = '0';
    popup.appendChild(note);

    overlay.appendChild(popup);

    document.body.appendChild(overlay);

}

import { shouldShowPopup, setFlag } from '../../util/firstViewPopupFlags.js';
/** ポップアップを表示するかフラグを取得して判断する関数 */
export async function showInitialFeaturePromotionPopup() {
    console.log(await shouldShowPopup(POPUP_FLAG_KEY));
    if (await shouldShowPopup(POPUP_FLAG_KEY)) {
        // ポップアップを表示
        initiatePopupPromotion();
        // フラグを true に更新して、次回以降は表示しないようにする
        await setFlag(POPUP_FLAG_KEY, true);
    }
}


