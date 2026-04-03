import noticeInfo from "./noticeInfo.js";
// 何日前の予定まで表示するかを指定する定数 (後でlocalStorageから取得するように変更予定)
const displayBeforeDay = 7;

/** 通知要素を作成して返す関数
 * @return {HTMLElement} noticeElement - 予定通知を表示するためのHTML要素
 */
export function createNoticeElement() {
  const noticeParentElement = document.createElement("div");
  noticeParentElement.setAttribute("id", "noticeElement");
  noticeParentElement.style.backgroundColor = "#f0f0f0";
  noticeParentElement.style.padding = "10px";
  noticeParentElement.style.margin = "20px 0";
  noticeParentElement.style.borderRadius = "5px";
  noticeParentElement.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
  noticeParentElement.style.fontSize = "15px";
  noticeParentElement.style.color = "#333";
  noticeParentElement.textContent = "予定通知: ここに予定が表示されます。";
  return noticeParentElement;
}
