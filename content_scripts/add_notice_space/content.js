/* ストレージから機能のオンオフを読み込んで実行するか判断する部分 *********************/
// この機能に対応するキー名を定義
// キー名はバンドル時に置換される
const FEATURE_KEY = "__FEATURE_KEY_PLACEHOLDER__";

/**
 * この機能が有効になっているかブラウザのストレージから確認する関数
 * @returns {Promise<boolean>} 機能が有効ならtrue、無効ならfalse
 */
async function shouldRun() {
  try {
    const result = await chrome.storage.sync.get("toggle_" + FEATURE_KEY);
    // キーが存在しない場合はtrue（ON）をデフォルトとする
    return result["toggle_" + FEATURE_KEY] !== false;
  } catch (error) {
    console.error(
      `機能(${FEATURE_KEY})の有効/無効状態の取得に失敗しました:`,
      error,
    );
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

import { createNoticeElement } from "./element.js";

// ブラウザ読み込み時にメイン関数を実行。
function main() {
  console.log("予定通知機能を実行します。");
  // 予定通知要素を作成
  const noticeElement = createNoticeElement();
  if (!noticeElement) {
    throw new Error("予定通知要素の作成に失敗しました。");
  }

  // 予定通知要素をマイコースページの上部に挿入
  const parentContainer = document.querySelector("#instance-5-header");
  const timetableElement = parentContainer.querySelector("#div_TT");
  // 時間割要素が存在する場合はその前に、存在しない場合は親コンテナの最後に挿入
  if (timetableElement) {
    parentContainer.insertBefore(noticeElement, timetableElement);
  } else {
    // 時間割要素が見つからない場合は親コンテナの最後に挿入
    parentContainer.appendChild(noticeElement);
  }
}
