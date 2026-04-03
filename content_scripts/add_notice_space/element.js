import scheduleInfoArr from "./noticeInfo.js";
// 何日前の予定まで表示するかを指定する定数 (後でlocalStorageから取得するように変更予定)
const displayBeforeDay = 7;

function formatDateWithWeekday(date, includeTime) {
  const dateString = date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  if (!includeTime) {
    return dateString;
  }

  const timeString = date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateString} ${timeString}`;
}

/** 通知要素を作成して返す関数
 * @return {HTMLElement} noticeElement - 予定通知を表示するためのHTML要素
 */
export function createNoticeElement() {
  let hasNotice = false;
  // 通知要素の親コンテナを作成
  const noticeParentElement = document.createElement("div");
  noticeParentElement.setAttribute("id", "noticeElement");
  noticeParentElement.style.backgroundColor = "#f5f5f5";
  noticeParentElement.style.padding = "14px";
  noticeParentElement.style.margin = "20px 0";
  noticeParentElement.style.borderRadius = "8px";
  noticeParentElement.style.border = "1px solid #d0d0d0";
  noticeParentElement.style.display = "flex";
  noticeParentElement.style.flexDirection = "column";
  noticeParentElement.style.rowGap = "12px";
  noticeParentElement.style.fontSize = "15px";
  noticeParentElement.style.color = "#333";

  // 通知情報をループして、表示する予定を作成
  scheduleInfoArr.forEach((notice) => {
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
      noticeElement.style.padding = "10px 12px";
      noticeElement.style.backgroundColor = "#fff";
      noticeElement.style.borderRadius = "6px";
      noticeElement.style.border = "1px solid #dddddd";

      const titleElement = document.createElement("h3");
      titleElement.style.margin = "0 0 6px";
      titleElement.style.fontSize = "20px";
      titleElement.style.lineHeight = "1.5";
      if (diffDays > 0) {
        titleElement.style.color = "#2f2f2f";
      } else if (dedDiffDays > 0) {
        titleElement.style.color = "#2457b2";
      } else {
        titleElement.style.color = "#a23a3a";
      }
      titleElement.textContent = notice.title;
      if (diffDays <= 0) {
        const dedlineElement = document.createElement("span");
        dedlineElement.textContent = `締切まであと${dedDiffDays}日`;
        dedlineElement.style.fontSize = "12px";
        dedlineElement.style.color = "#666666";
        dedlineElement.style.marginLeft = "8px";
        titleElement.appendChild(dedlineElement);
      }
      noticeElement.appendChild(titleElement);

      if (notice.description) {
        const descriptionElement = document.createElement("p");
        descriptionElement.textContent = notice.description;
        descriptionElement.style.margin = "0 0 6px";
        descriptionElement.style.color = "#4d4d4d";
        descriptionElement.style.lineHeight = "1.5";
        noticeElement.appendChild(descriptionElement);
      }

      const datetimeElement = document.createElement("p");
      // 時間が指定されていない場合は、日付のみ表示する
      const startTimeString = formatDateWithWeekday(startDate, startHasTime);
      const endTimeString = formatDateWithWeekday(endDate, endHasTime);
      datetimeElement.textContent = `期間: ${startTimeString} ~ ${endTimeString}`;
      if (!hasEnd && !startHasTime) {
        datetimeElement.textContent = `日時: ${startTimeString}`;
      }
      datetimeElement.style.margin = "0 0 8px";
      datetimeElement.style.color = "#666666";
      datetimeElement.style.fontSize = "13px";
      noticeElement.appendChild(datetimeElement);

      if (notice.link) {
        const linkElement = document.createElement("a");
        linkElement.href = notice.link;
        linkElement.target = "_blank";
        linkElement.rel = "noreferrer noopener";
        linkElement.textContent = "詳細を見る";
        linkElement.style.display = "inline-block";
        linkElement.style.color = "#2457b2";
        linkElement.style.textDecoration = "underline";
        linkElement.style.fontSize = "13px";
        noticeElement.appendChild(linkElement);
      }

      noticeParentElement.appendChild(noticeElement);
    }
  });
  if (!hasNotice) {
    return null;
  }

  const officialLinkElement = document.createElement("a");
  officialLinkElement.href =
    "https://www.iizuka.kyutech.ac.jp/faculty/educational-info";
  officialLinkElement.target = "_blank";
  officialLinkElement.rel = "noreferrer noopener";
  officialLinkElement.textContent = "公式ページ";

  const cautionElement = document.createElement("p");
  cautionElement.append(
    "※予定は事前に取得した情報のため、変更されている可能性があります。最新情報は",
  );
  cautionElement.appendChild(officialLinkElement);
  cautionElement.append("で確認してください。");
  cautionElement.style.margin = "2px 0 0";
  cautionElement.style.fontSize = "12px";
  cautionElement.style.color = "#777777";
  noticeParentElement.appendChild(cautionElement);

  return noticeParentElement;
}
