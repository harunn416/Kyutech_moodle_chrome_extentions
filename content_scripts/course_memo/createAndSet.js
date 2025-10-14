// メモの取得、削除を行う関数をインポート
import { getMemoList, getMemoJson, saveMemoJson, deleteMemoJson } from "./saveJsonData.js";

// 「その他」のメモ用の予約キーの定義をインポート
import { OTHER_NOTES_KEY, REQUIRED_ROOT_KEY } from './content.js';

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
    // コース名が変更されたら保存
    currentCourseNameInput.addEventListener("change", saveCurrentMemo);
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
    memoWritingArea.style.padding = "10px 10px 1px 10px";
    memoWritingArea.style.overflowY = "auto"; // 縦スクロールを有効にする

    // メモを書くテキストエリア
    const memoTextArea = document.createElement("textarea");
    memoTextArea.id = "memo-textarea";
    memoTextArea.classList = "note-textarea"
    memoTextArea.style.border = "solid 3px #00ff002e"; // 初期状態は緑の枠
    // memoTextArea.style.width = "100%";
    // memoTextArea.style.height = "100%";
    // memoTextArea.style.resize = "none"; // ユーザーによるリサイズを無効にする
    // memoTextArea.style.boxSizing = "border-box"; // パディングとボーダーを含めてサイズを計算

    // テキストエリアの内容が変更されたら保存
    memoTextArea.addEventListener("input", () => {
        debouncedSave(); // Debounce処理を使って保存
        indicateUnsaved(); // 未保存の縁を赤くする
    });

    memoWritingArea.appendChild(memoTextArea);

    return memoWritingArea;
}

/** フッターを生成する関数 */
function createFooter() {
    // フッター要素
    const footer = document.createElement("div");
    footer.id = "memo-footer";
    footer.style.padding = "7px";
    footer.style.borderTop = "#d9d9d9 dashed 2px";
    footer.style.textAlign = "right";

    // エクスポートボタン
    const exportButton = document.createElement("button");
    exportButton.textContent = "エクスポート";
    exportButton.classList = "footer-button";
    exportButton.style.backgroundColor = "#d54dffff";
    exportButton.style.color = "white";
    exportButton.addEventListener("click", exportMemoJsonData);
    footer.appendChild(exportButton);

    // インポートボタン
    const importButton = document.createElement("button");
    importButton.textContent = "インポート";
    importButton.classList = "footer-button";
    importButton.style.backgroundColor = "#4d79ff";
    importButton.style.color = "white";
    importButton.addEventListener("click", importMemoData);
    footer.appendChild(importButton);

    // 非表示のファイル入力要素（インポート用）
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "fileInput_kyutech";
    fileInput.accept = ".json,application/json";
    fileInput.style.display = "none"; // 非表示にする
    footer.appendChild(fileInput);

    // クリアボタン
    const clearButton = document.createElement("button");
    clearButton.textContent = "クリア";
    clearButton.classList = "footer-button";
    clearButton.style.backgroundColor = "#5fe535";
    clearButton.style.color = "white";
    clearButton.addEventListener("click", resetCurrentMemo);
    footer.appendChild(clearButton);

    // 削除ボタン
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.classList = "footer-button";
    deleteButton.style.backgroundColor = "#ff4d4d";
    deleteButton.style.color = "white";
    deleteButton.addEventListener("click", deleteCurrentMemo);
    footer.appendChild(deleteButton);

    return footer;
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

    // フッターを作成してメモ欄に追加
    const footer = createFooter();
    sideMemoBar.appendChild(footer);

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

/** コース名とメモ記述欄の内容を保存する関数 */
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
            indicateSaved(); // 保存が完了したら枠を緑にする
        })
        .catch((error) => {
            console.error("メモの保存に失敗しました:", error);
        });
}

// Debounce関数を定義 (一定期間、再実行を遅延させる)
function debounce(func, delay = 500) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}
// 500ms（0.5秒）入力が止まったら保存を実行する、Debounce処理を作成
const debouncedSave = debounce(saveCurrentMemo, 500);

/** 未保存の場合縁を赤くし、未保存状態をユーザーに知らせる関数 */
function indicateUnsaved() {
    const memoTextArea = document.getElementById("memo-textarea");
    memoTextArea.style.border = "solid 3px #ff000015";
}

/** 保存が完了したら枠を緑にして、ユーザーに保存が完了したことを伝える関数 */
function indicateSaved() {
    const memoTextArea = document.getElementById("memo-textarea");
    memoTextArea.style.border = "solid 3px #00ff002e";
}

/** 現在表示されているメモを削除する関数 */
async function deleteCurrentMemo() {
    // 現在選択されているコースIDを取得
    const courseSelect = document.getElementById("course-select");
    const selectedCourseID = courseSelect.value;
    
    if (selectedCourseID === OTHER_NOTES_KEY) {
        alert("「その他」のメモは削除できません。");
        return;
    }
    // 確認ダイアログを表示
    const confirmDelete = confirm("本当にこのメモを削除しますか？この操作は元に戻せません。");
    if (!confirmDelete) {
        return; // ユーザーがキャンセルした場合は何もしない
    }
    try {
        await deleteMemoJson(selectedCourseID);
        console.log("メモを削除しました:", selectedCourseID);
        // サイドメモバーを閉じる
        openHideFeatureSettingsPopup();
    } catch (error) {
        console.error("メモの削除に失敗しました:", error);
    }
}

/** 現在表示されているメモをリセット(contentを空白に置き換える)する関数 */
async function resetCurrentMemo() {
    // 現在選択されているコースIDを取得
    const courseSelect = document.getElementById("course-select");
    const selectedCourseID = courseSelect.value;

    // 確認ダイアログを表示
    const confirmReset = confirm("本当にこのメモをリセットしますか？この操作は元に戻せません。");
    if (!confirmReset) {
        return; // ユーザーがキャンセルした場合は何もしない
    }

    // メモ記述欄の内容を取得
    const memoTextArea = document.getElementById("memo-textarea");
    memoTextArea.value = ""; // メモ記述欄を空にする
    
    // 空のメモを保存
    saveCurrentMemo();
}


/**
 * chrome.storage.local に保存されている「memo_」で始まるキーのデータのみをエクスポートする
 */
async function exportMemoJsonData() {
    console.log("エクスポート対象のデータを取得中...");
    
    // 1. chrome.storage.local に保存されている全データを取得
    //   (キーを指定しない get() は、すべてのキーと値のペアを返す)
    const allData = await new Promise((resolve, reject) => {
        // null または {} を渡すと全データを取得
        chrome.storage.local.get(null, (result) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            resolve(result);
        });
    });

    // 2. 取得したデータから「memo_」で始まるキーだけをフィルタリング
    const exportedData = {};
    
    for (const key in allData) {
        if (key.startsWith('memo_')) {
            // memo_ で始まるキーとその値を新しいオブジェクトに追加
            exportedData[key] = allData[key];
        }
    }

    if (Object.keys(exportedData).length === 0) {
        console.warn("エクスポート対象のメモデータが見つかりませんでした。");
        alert("保存されているメモが見つかりません。");
        return;
    }

    const saveJsonData = {
        memoData: exportedData
    };

    // 3. JSON文字列に変換（整形して読みやすくするために第3引数に '2' を指定）
    const jsonString = JSON.stringify(saveJsonData, null, 2); 
    
    // 4. ファイルとしてダウンロードさせる処理
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // 拡張機能名と日付を使ったファイル名を生成
    const date = new Date().toISOString().slice(0, 10);
    const fileName = `extension_memo_backup_${date}.json`;

    // ダウンロードを実行
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`✅ メモデータが ${fileName} としてエクスポートされました。`);
}

/**
 * メモデータをファイルから読み込み、chrome.storage.local にインポートする
 */
function importMemoData() {
    // 警告を表示
    const proceed = confirm("インポートを実行すると、既存のメモデータが上書きされます。\nよろしいですか？");
    if (!proceed) {
        return; // ユーザーがキャンセルした場合は何もしない
    }

    const fileInput = document.getElementById('fileInput_kyutech');
    
    // 1. ファイル選択をトリガー
    fileInput.click();

    // 2. ファイルが選択されたときの処理を設定
    fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            console.log("ファイルが選択されませんでした。");
            return;
        }

        const reader = new FileReader();

        // 3. ファイルの読み込みが完了したときの処理
        reader.onload = async (e) => {
            try {
                // ファイル内容（JSON文字列）を取得
                const jsonText = e.target.result;
                const parsedData = JSON.parse(jsonText);

                // 4. データ構造の検証
                if (!parsedData[REQUIRED_ROOT_KEY]) {
                    alert("エラー: ファイルの形式が正しくありません。\n'memoData' キーが見つかりませんでした。");
                    return;
                }

                const dataToImport = parsedData[REQUIRED_ROOT_KEY];
                
                // 5. インポート（chrome.storage.local にデータ全体を上書き保存）
                await new Promise((resolve, reject) => {
                    // dataToImport の中には { "memo_3479": { ... }, "memo_4027": { ... } } という構造が入っている
                    chrome.storage.local.set(dataToImport, () => {
                        if (chrome.runtime.lastError) {
                            return reject(chrome.runtime.lastError);
                        }
                        resolve();
                    });
                });

                alert("✅ メモデータのインポートが完了しました。\n（既存のメモは上書きされました）");
                console.log("インポートされたデータ:", dataToImport);

                // インポート後、メモ欄を閉じる
                openHideFeatureSettingsPopup();
                
            } catch (error) {
                if (error instanceof SyntaxError) {
                    alert("エラー: ファイルの内容が不正なJSON形式です。");
                } else {
                    alert(`エラーが発生しました: ${error.message}`);
                }
                console.error("インポート処理中にエラー:", error);
            }
        };

        // 6. ファイルをテキスト形式で読み込む
        reader.readAsText(file);
    };
}


/** 機能実行時、[その他]がなければ作成する関数 */
export async function createOtherIfNotExist() {
    // メモリストを取得
    const memoList = await getMemoList();
    // メモリストの中に「その他」のメモがあるか確認
    const otherExists = memoList.some(memo => memo.courseID === OTHER_NOTES_KEY);
    // 「その他」のメモがない場合は新しく作成
    if (!otherExists) {
        const newMemoData = { title: "その他", content: "", isMarkdown: false};
        await saveMemoJson(OTHER_NOTES_KEY, newMemoData);
        console.log("「その他」のメモを作成しました:", newMemoData);
    }
}