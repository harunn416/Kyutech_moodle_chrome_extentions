// メモの取得、削除を行う関数をインポート
import { getMemoList, getMemoJson, saveMemoJson } from "./saveJsonData.js";

// 「その他」のメモ用の予約キーの定義をインポート
import { OTHER_NOTES_KEY } from './content.js';

/** メモ欄を出すトグルを生成し、挿入する関数
 * @returns {HTMLDivElement} 生成したトグルのdiv要素
 */
const createToggleElement = () => {
    // トグルの親要素
    const togglerDiv = document.createElement("div");
    togglerDiv.id = "memo-icon";

    // 画像のURLを拡張機能のAPIから取得
    const iconUrl = chrome.runtime.getURL("assets/course_memo/memo_icon.png");

    // スタイルを設定
    togglerDiv.style.backgroundImage = `url(${iconUrl})`;
    togglerDiv.style.backgroundColor = "#d4d4d4"; // 通常時の背景色

    // ホバーイベント
    togglerDiv.addEventListener("mouseover", () => {
        togglerDiv.style.backgroundColor = "#a6a6a6"; // ホバー時の背景色
        togglerDiv.style.width = "55px";
    });

    togglerDiv.addEventListener("mouseout", () => {
        togglerDiv.style.backgroundColor = "#d4d4d4"; // 通常時の背景色
        togglerDiv.style.width = "50px";
    });

    // 仮の要素
    togglerDiv.appendChild(document.createElement("span"));

    // クリックイベント
    togglerDiv.addEventListener("click", openHideFeatureSettingsPopup);

    // トグルを挿入する要素
    // const targetElement = document.querySelector('div#page');
    // targetElement.prepend(togglerDiv);
    return togglerDiv;
};

/** メモ欄のコースを生成する関数
 * @return {HTMLDivElement} 生成したコース選択セクションのdiv要素
 */
async function createCourseList() {
    // セレクトボックスとコース名を入れるdiv
    const courseSelectContainer = document.createElement("div");
    courseSelectContainer.style.display = "flex";
    courseSelectContainer.style.flexDirection = "column";
    courseSelectContainer.style.alignItems = "flex-start";
    courseSelectContainer.style.padding = "20px 10px 10px 10px";
    courseSelectContainer.style.borderBottom = "#d9d9d9 dashed 2px";

    // コース一覧を表示するセレクトボックス
    const courseSelect = document.createElement("select");
    courseSelect.id = "course-select";
    courseSelect.style.width = "100%";

    // デフォルトのオプションを追加
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "コースを選択";
    courseSelect.appendChild(defaultOption);

    // セレクトボックスの選択が変わったときのイベント
    courseSelect.addEventListener("change", (event) => {
        const selectedCourseID = event.target.value;
        // 選択されたコースIDに対応するメモを取得して表示
        loadMemoForCourse(selectedCourseID);
    });

    // 今のコース名を表示する要素
    const currentCourseNameLabel = document.createElement("label");
    currentCourseNameLabel.htmlFor = "current-course-name";
    currentCourseNameLabel.style.margin = "5px 0";
    currentCourseNameLabel.style.width = "100%";
    currentCourseNameLabel.textContent = "現在のコース名: ";
    const currentCourseNameInput = document.createElement("input");
    currentCourseNameInput.type = "text";
    currentCourseNameInput.required = true;
    currentCourseNameInput.id = "current-course-name";
    currentCourseNameInput.style.width = "100%";
    currentCourseNameLabel.appendChild(currentCourseNameInput);

    courseSelectContainer.appendChild(courseSelect);
    courseSelectContainer.appendChild(currentCourseNameLabel);

    return courseSelectContainer;
}

/** メモ欄(書く部分)を生成する関数 */
function createMemoWritingArea() {
    const memoWritingArea = document.createElement("div");
    memoWritingArea.id = "memo-writing-area";
    memoWritingArea.style.flexGrow = "1";
    memoWritingArea.style.padding = "10px";
    memoWritingArea.style.overflowY = "auto"; // 縦スクロールを有効にする

    // メモを書くテキストエリア
    const memoTextArea = document.createElement("textarea");
    memoTextArea.id = "memo-textarea";
    memoTextArea.classList = "note-textarea"
    // memoTextArea.style.width = "100%";
    // memoTextArea.style.height = "100%";
    // memoTextArea.style.resize = "none"; // ユーザーによるリサイズを無効にする
    // memoTextArea.style.boxSizing = "border-box"; // パディングとボーダーを含めてサイズを計算

    memoWritingArea.appendChild(memoTextArea);

    return memoWritingArea;
}

/** メモ欄全体を生成する関数
 * @returns {HTMLDivElement} 生成したメモ欄のdiv要素
 */
async function createSideMemoBar() {
    // メモ欄要素の作成
    const sideMemoBar = document.createElement("div");
    sideMemoBar.id = "course-memo-sidebar";
    sideMemoBar.style.display = "none"; // 初期状態では非表示
    sideMemoBar.style.flexDirection = "column";
    sideMemoBar.style.height = "calc(100% - 60px)"; // ヘッダーの高さを引く
    sideMemoBar.style.backgroundColor = "#f9f9f9";
    sideMemoBar.style.padding = "0";
    sideMemoBar.style.marginTop = "60px";
    sideMemoBar.style.zIndex = "2";

    // コース選択セクションを作成してメモ欄に追加
    const courseSelectContainer = await createCourseList();
    sideMemoBar.appendChild(courseSelectContainer);

    // メモを書くエリアを作成してメモ欄に追加
    const memoWritingArea = createMemoWritingArea();
    sideMemoBar.appendChild(memoWritingArea);

    // セレクトボックスと今のコース名を表示する要素をメモ欄に追加
    return sideMemoBar;
}

/** メモ欄全体を作成し、ページに挿入する関数 */
export async function showFeatureSettingsPopup() {
    /* page要素をトグルとラッピングして、そのラッピング要素とメモ欄をさらにラッピングする
     * もともとの構造
     * page
     * --------------------------------------------------
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

    // コース一覧とメモトグルをいれるコンテナ
    const newWrapperToggle = document.createElement("div");
    newWrapperToggle.style.flexGrow = "1";

    // ラッピングするターゲット要素
    const targetElement = document.querySelector("div#page");

    // ターゲット要素を横いっぱいに広げる
    targetElement.style.flexGrow = "1";

    // ターゲット要素の親要素を取得
    const parentElementPage = targetElement.parentNode;

    // 新しい親要素を、元の要素の位置に挿入する
    parentElementPage.insertBefore(newWrapperToggle, targetElement);

    // トグル要素を作成して追加
    const toggleElement = createToggleElement();
    newWrapperToggle.prepend(toggleElement);

    // 元の要素を新しい親要素に移動する
    newWrapperToggle.appendChild(targetElement);

    // メモ欄と"コース一覧とメモトグル"を横並びにするためのコンテナ
    const newWrapperMemo = document.createElement("div");
    newWrapperMemo.id = "course-memo-wrapper";
    newWrapperMemo.style.display = "flex";

    // ターゲット要素の親要素を取得
    const parentElementToggle = newWrapperToggle.parentNode;

    // 新しい親要素を、元の要素の位置に挿入する
    parentElementToggle.insertBefore(newWrapperMemo, newWrapperToggle);

    // ターゲット要素を新しいラッパーに移動
    newWrapperMemo.appendChild(newWrapperToggle);

    // セパレーターを作成して追加
    const separator = document.createElement("div");
    separator.id = "course-memo-separator";
    newWrapperMemo.appendChild(separator);

    // メモ欄を新しいラッパーに追加
    const sideMemoBar = await createSideMemoBar();
    newWrapperMemo.appendChild(sideMemoBar);
}

/** メモ欄を開閉する関数 */
async function openHideFeatureSettingsPopup() {
    const sideMemoBar = document.querySelector("#course-memo-sidebar");
    const separator = document.querySelector("#course-memo-separator");
    if (sideMemoBar.style.display == "none") { // メモ欄が閉じている場合 => 開く
        // 現在のページのURLから 'id' を取得する
        const currentParams = new URLSearchParams(window.location.search);
        let courseID = currentParams.get('id') || OTHER_NOTES_KEY; // 'id' パラメータがない場合は「その他」のメモを使用
        await insertTextAtCursor(courseID); // メモ欄を開いた時、文字列を挿入する関数を実行
        // メモ記述欄にメモを挿入
        loadMemoForCourse(courseID);
        sideMemoBar.style.display = "flex";
        sideMemoBar.style.width = "30%"; // メモ欄を開く
        separator.style.display = "block"; // セパレーターを表示
    } else { // メモ欄が開いている場合 => 閉じる
        sideMemoBar.style.display = "none"; // メモ欄を閉じる
        separator.style.display = "none"; // セパレーターを非表示
    }
}

/** メモ欄を開いた時、セレクトボックスにコース一覧を挿入する関数 */
async function insertTextAtCursor(courseID) {
    // メモリストを取得
    let memoList = await getMemoList();
    

    // メモリストの中に現在のコースIDに対応するメモがあるか確認
    const memoExists = memoList.some(memo => memo.courseID === courseID);
    // メモがない場合は新しく作成
    if (!memoExists) {
        let currentCourseName = "その他";
        try{
            // 現在のコース名を取得
            const currentCourseNameInput = document.querySelector("header#page-header div.mr-auto h1.h2")
            currentCourseName = currentCourseNameInput.textContent.trim() || "その他";
        } catch (error) {
            console.error("コース名の取得に失敗しました:", error);
            currentCourseName = "その他";
        }

        // メモリストに新しいメモを追加
        const newMemoData = { title: currentCourseName, content: "", isMarkdown: false};

        // メモを保存
        await saveMemoJson(courseID, newMemoData);
        console.log("新しいメモを作成しました:", courseID, newMemoData);

        // メモリストを再取得
        memoList = await getMemoList();
    }

    // 取得したコース一覧をセレクトボックスに追加
    const courseSelect = document.querySelector("select#course-select");
    // 既存のオプションをクリア (innerHTML はセキュリティリスクがあるため、今回は使用しない)
    while (courseSelect.firstChild) {
        courseSelect.removeChild(courseSelect.firstChild);
    }
    // 最初にその他のメモを追加
    const option = document.createElement("option");
    option.value = OTHER_NOTES_KEY; // メモのキーを値として使用
    option.textContent = "その他"; // コース名を表示
    courseSelect.appendChild(option);
    // その他以外のメモを追加
    memoList.forEach((memo) => {
        if(memo.courseID !== OTHER_NOTES_KEY) { // 「その他」のメモは最初に追加
            const option = document.createElement("option");
            option.value = memo.courseID; // メモのコースIDを値として使用
            option.textContent = memo.name; // コース名を表示
            courseSelect.appendChild(option);
        }
    });

    // セレクトボックスの値を現在のコースIDに設定
    courseSelect.value = courseID;

}

/** コースidからメモを取得し、メモ記述欄に挿入する関数 */
async function loadMemoForCourse(courseID) {
    //try {
        // メモデータを取得
        const memoData = await getMemoJson(courseID);
        // 内容をメモ記述欄に挿入
        const memoTextArea = document.getElementById("memo-textarea");
        memoTextArea.value = memoData.content;
        // コース名をコース名入力欄に挿入
        const currentCourseNameInput = document.getElementById("current-course-name");
        currentCourseNameInput.value = memoData.title;
        // カーソルを合わせたときにIDを表示
        currentCourseNameInput.title = `コースID: ${courseID}`;


    // } catch (error) {
    //     console.error("メモの取得に失敗しました:", error);
    // }
}

function saveCurrentMemo() {
    // 現在選択されているコースIDを取得
    const courseSelect = document.getElementById("course-select");
    const selectedCourseID = courseSelect.value;

    // メモ記述欄の内容を取得
    const memoTextArea = document.getElementById("memo-textarea");
    const memoContent = memoTextArea.value;

    // コース名入力欄の内容を取得
    const currentCourseNameInput = document.getElementById("current-course-name");
    const courseName = currentCourseNameInput.value || "無題のコース";

    // メモデータを保存
    const memoData = {
        title: courseName,
        content: memoContent,
        isMarkdown: false // 今回はMarkdown機能は未実装なのでfalseで固定
    };

    saveMemoJson(selectedCourseID, memoData)
        .then(() => {
            console.log("メモを保存しました:", selectedCourseID, memoData);
            // コース名セレクトボックスの表示名も更新
            const selectedOption = courseSelect.querySelector(`option[value="${selectedCourseID}"]`);
            if (selectedOption) {
                selectedOption.textContent = courseName;
            }
        })
        .catch((error) => {
            console.error("メモの保存に失敗しました:", error);
        });
}