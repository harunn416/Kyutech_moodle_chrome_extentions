import noticeInfo from "./noticeInfo.js";
// 何日前の予定まで表示するかを指定する定数 (後でlocalStorageから取得するように変更予定)
const displayBeforeDay = 7;

/** 通知要素を作成して返す関数
 * @return {HTMLElement} noticeElement - 予定通知を表示するためのHTML要素
 */
export function createNoticeElement() {
  let hasNotice = false;
  // 通知要素の親コンテナを作成
  const noticeParentElement = document.createElement("div");
  noticeParentElement.setAttribute("id", "noticeElement");
  noticeParentElement.style.backgroundColor = "#f0f0f0";
  noticeParentElement.style.padding = "10px";
  noticeParentElement.style.margin = "20px 0";
  noticeParentElement.style.borderRadius = "5px";
  noticeParentElement.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
  noticeParentElement.style.fontSize = "15px";
  noticeParentElement.style.color = "#333";

  // 通知情報をループして、表示する予定を作成
  noticeInfo.forEach((notice) => {
    // バリデーション: タイトルと開始日時が必須
    if (!notice.title || !notice.start) {
      console.warn("予定通知の情報が不完全です:", notice);
      return; // タイトルまたは開始日時がない場合はスキップ
    }

    hasNotice = true;
    // 終了日時が指定されていない場合は、開始日時の23:59を終了日時とする
    let hasEnd = true;
    if (!notice.end) {
      hasEnd = false;
      notice.end = notice.start + " 23:59";
    }
    // 時間が指定されていない場合は、開始日時を00:00、終了日時を23:59に設定
    const startHasTime = /\d{1,2}:\d{2}/.test(notice.start);
    if (!startHasTime) {
      notice.start = notice.start + " 00:00";
    }
    const endHasTime = /\d{1,2}:\d{2}/.test(notice.end);
    if (!endHasTime) {
      notice.end = notice.end + " 23:59";
    }
    const startDate = new Date(notice.start);
    const endDate = new Date(notice.end);
    const now = new Date();
    const diffTime = startDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // あと何日か計算
    if (diffDays <= displayBeforeDay && now <= endDate) {
      // 締切まであと何日か計算
      const dedDiffTime = endDate.getTime() - now.getTime();
      const dedDiffDays = Math.floor(dedDiffTime / (1000 * 60 * 60 * 24));

      // 予定要素を作成
      const noticeElement = document.createElement("div");
      noticeElement.style.marginBottom = "10px";

      const titleElement = document.createElement("h3");
      if (diffDays > 0) {
        titleElement.style.color = "#292929";
      } else if (dedDiffDays > 0) {
        titleElement.style.color = "#0119a1";
      } else {
        titleElement.style.color = "#a10101";
      }
      titleElement.textContent = notice.title;
      if (diffDays <= 0) {
        const dedlineElement = document.createElement("span");
        dedlineElement.textContent = `締切まであと${dedDiffDays}日`;
        dedlineElement.style.fontSize = "14px";
        dedlineElement.style.color = "#707070";
        dedlineElement.style.marginLeft = "10px";
        dedlineElement.style.marginBottom = "5px";
        titleElement.appendChild(dedlineElement);
      }
      noticeElement.appendChild(titleElement);

      if (notice.description) {
        const descriptionElement = document.createElement("p");
        descriptionElement.textContent = notice.description;
        descriptionElement.style.marginBottom = "5px";
        noticeElement.appendChild(descriptionElement);
      }

      const datetimeElement = document.createElement("p");
      // 時間が指定されていない場合は、日付のみ表示する
      let startTimeString = startDate.toLocaleString();
      let endTimeString = endDate.toLocaleString();
      if (!startHasTime) {
        startTimeString = startDate.toLocaleDateString();
      }
      if (!endHasTime) {
        endTimeString = endDate.toLocaleDateString();
      }
      datetimeElement.textContent = `日時: ${startTimeString} ~ ${endTimeString}`;
      if (!hasEnd && !startHasTime) {
        datetimeElement.textContent = `日時: ${startTimeString}`;
      }
      datetimeElement.style.marginBottom = "5px";
      noticeElement.appendChild(datetimeElement);

      if (notice.link) {
        const linkElement = document.createElement("a");
        linkElement.style.marginBottom = "5px";
        linkElement.href = notice.link;
        linkElement.target = "_blank";
        linkElement.textContent = "詳細を見る";
        noticeElement.appendChild(linkElement);
      }

      noticeParentElement.appendChild(noticeElement);
    }
  });
  if (!hasNotice) {
    return null;
  }

  return noticeParentElement;
}
