import { observeElementAppearance } from "../../util/mutationObserver.js";
import { openCourseLink } from "./open_link.js";

/** ダッシュボードのタイムラインにコースを開くテキストを追加する関数 */
export function editDomToAddCourseLink() {
    const assignmentElementSelector = 'div#page div#page-content div.pb-2[data-region="event-list-wrapper"] div.timeline-event-list-item';
    observeElementAppearance(assignmentElementSelector, async () => {
        console.log("コールバック関数実行");

        document.querySelectorAll(assignmentElementSelector).forEach(async (assignmentElement) => {
            // すでに追加済みなら何もしない
            if (assignmentElement.dataset.courseLinkAdded === "true") return;

            // 課題IDと課題リンクを取得
            const assignmentLinkElement = assignmentElement.querySelector('div.timeline-name div.event-name-container a');
            let assignmentURL = "";
            let assignmentID = "";
            if (assignmentLinkElement) {
                assignmentURL = assignmentLinkElement.getAttribute("href");
                const url = new URL(assignmentURL);
                assignmentID = url.searchParams.get("id");
            }

            if (!assignmentURL) {
                console.warn("課題リンクが取得できませんでした。");
                return;
            }

            // リンクdivを作成
            const linkDiv = document.createElement("div");
            linkDiv.className = "to-course-link-div standby";
            linkDiv.textContent = "コースを開く";

            // クリックイベントを追加
            linkDiv.addEventListener("click", (e) => { openCourseLink(assignmentID, assignmentURL, e.target); });

            // divを追加
            assignmentElement.querySelector("div.event-name-container").appendChild(linkDiv);

            assignmentElement.dataset.courseLinkAdded = "true";
        });

    }, document.body, false, true);
}

/** ボタンのデザインを変える関数
 * @param {HTMLElement} buttonElement 対象のボタン要素
 * @param {string} caseType デザインのケース ( "standby" , "loading" , "error" )
 */
export function changeButtonDesign(buttonElement, caseType = "standby") {
    buttonElement.classList.remove("standby", "loading", "error");
    if (caseType === "loading") {
        buttonElement.classList.add("loading");
        buttonElement.textContent = "読み込み中...";
    } else if (caseType === "error") {
        buttonElement.classList.add("error");
        buttonElement.textContent = "エラー";
    } else {
        buttonElement.classList.add("standby");
        buttonElement.textContent = "コースを開く";
    }
}


