import './content.css'; // 追加: CSSファイルのインポート

// 外部ファイルで定義されている関数をインポート
import { createPageAddPopup, setEventTimetableCustomiseButton } from './timetableAddPopup.js'; // 仮のパスとファイル名
import { createPageEditPopup, showEditPopup } from './timetableEditPopup.js'; // 仮のパスとファイル名

/** main function */
async function main() {
    // ストレージから時間割データを読み込む
    let timetable_json = await loadTimetableFromStorage();

    // 時間割の表示エリアを作成
    let div_TT = document.createElement("div");
    div_TT.setAttribute("id", "div_TT");

    // 時間割のテーブル作成
    let tableDiv = document.createElement("div");
    tableDiv.setAttribute("id", "div_TT_TableDiv");
    tableDiv.appendChild(create_timetable(timetable_json));
    div_TT.appendChild(tableDiv);

    // 時間割の編集ボタンを作成
    div_TT.appendChild(createManualEditDiscription());

    // ページのヘッダーに時間割の表示エリアを追加
    document.querySelector("#instance-5-header").appendChild(div_TT);

    // ページのヘッダーに時間割の編集ポップアップを display: none で追加
    createPageAddPopup();
    createPageEditPopup();
}

// 初期状態の空の時間割データ構造を定義
const initialTimetableData = {
    "mon": {
        "1": { "name": "", "link": "", "courseID": null }, "2": { "name": "", "link": "", "courseID": null }, "3": { "name": "", "link": "", "courseID": null },
        "4": { "name": "", "link": "", "courseID": null }, "5": { "name": "", "link": "", "courseID": null }, "6": { "name": "", "link": "", "courseID": null }
    },
    "tue": {
        "1": { "name": "", "link": "", "courseID": null }, "2": { "name": "", "link": "", "courseID": null }, "3": { "name": "", "link": "", "courseID": null },
        "4": { "name": "", "link": "", "courseID": null }, "5": { "name": "", "link": "", "courseID": null }, "6": { "name": "", "link": "", "courseID": null }
    },
    "wed": {
        "1": { "name": "", "link": "", "courseID": null }, "2": { "name": "", "link": "", "courseID": null }, "3": { "name": "", "link": "", "courseID": null },
        "4": { "name": "", "link": "", "courseID": null }, "5": { "name": "", "link": "", "courseID": null }, "6": { "name": "", "link": "", "courseID": null }
    },
    "thu": {
        "1": { "name": "", "link": "", "courseID": null }, "2": { "name": "", "link": "", "courseID": null }, "3": { "name": "", "link": "", "courseID": null },
        "4": { "name": "", "link": "", "courseID": null }, "5": { "name": "", "link": "", "courseID": null }, "6": { "name": "", "link": "", "courseID": null }
    },
    "fri": {
        "1": { "name": "", "link": "", "courseID": null }, "2": { "name": "", "link": "", "courseID": null }, "3": { "name": "", "link": "", "courseID": null },
        "4": { "name": "", "link": "", "courseID": null }, "5": { "name": "", "link": "", "courseID": null }, "6": { "name": "", "link": "", "courseID": null }
    }
};

/**
 * 時間割データを読み込み、存在しない場合は初期データを保存する関数
 * @returns {Promise<Object>} 時間割データのオブジェクト(エラー時は初期データ)
 */
export async function loadTimetableFromStorage() {
    try {
        const result = await chrome.storage.sync.get('myUniversityTimetable');
        let timetableData = result.myUniversityTimetable;
        if (!timetableData) {
            console.log("localStorageに時間割データがないため、新規作成します。");
            try {
                // オブジェクトのキーと値のペアで保存
                // { '保存キー': 保存したい値 }
                await chrome.storage.sync.set({ 'myUniversityTimetable': initialTimetableData });
                console.log('新規データが保存されました');
                timetableData = initialTimetableData;
            } catch (error) {
                console.error('新規データの保存に失敗しました:', error);
                timetableData = initialTimetableData;
            }
            // 初回読み込み時に初期データを保存しておくことも可能 (任意)
            //await chrome.storage.sync.set({ 'myUniversityTimetable': timetableData });
        } else {
            console.log("localStorageから時間割データを読み込みました:", timetableData);
        }
        return timetableData;
    } catch (error) {
        console.error('時間割の読み込み中にエラーが発生しました:', error);
        // エラー時は初期データを返すなど、安全策をとる
        return initialTimetableData;
    }
}

/** 時間割データをリセットする */
async function resetTimetableFromStorage() {
    let result = window.confirm(
        "時間割表のデータを削除します。削除したデータは復元できません。(コース自体が消えることはありません。)\nそれでも削除しますか？");
    if (result) {
        try {
            await chrome.storage.sync.set({ 'myUniversityTimetable': initialTimetableData });
            console.log('新規データが保存されました');
        } catch (error) {
            console.log("時間割削除中にエラーが発生しました。", error);
        }
    }
    updateTimetable(); // 時間割を更新
    console.log("時間割表をリセットしました");
}

/**
 * 時間割データを更新する関数
 * @param {Object} courseInformationIncludeTimeJson - コース情報と時間情報を含むJSONオブジェクト
 * @returns {Promise<boolean>} 更新が成功したかどうかの真偽値
 */
export async function updateTimetableAtStorage(courseInformationIncludeTimeJson) {
    console.log(courseInformationIncludeTimeJson);
    try {
        const result = await chrome.storage.sync.get('myUniversityTimetable');
        let timetableData = result.myUniversityTimetable;
        if (!timetableData) {
            console.log("時間割データを読み込めませんでした。");
            return false;
            // 初回読み込み時に初期データを保存しておくことも可能 (任意)
            // await chrome.storage.sync.set({ 'myUniversityTimetable': timetableData });
        } else {
            console.log("localStorageから時間割データを読み込みました:", timetableData);
            courseInformationIncludeTimeJson.times.forEach((timeJson) => {
                timetableData[timeJson.day][timeJson.period]["name"] = courseInformationIncludeTimeJson["courseInformation"]["name"];
                timetableData[timeJson.day][timeJson.period]["link"] = courseInformationIncludeTimeJson["courseInformation"]["link"];
                timetableData[timeJson.day][timeJson.period]["courseID"] = courseInformationIncludeTimeJson["courseInformation"]["courseID"];
            });
            // オブジェクトのキーと値のペアで保存
            // { '保存キー': 保存したい値 }
            await chrome.storage.sync.set({ 'myUniversityTimetable': timetableData });
        }
    } catch (error) {
        console.error('時間割の読み込み中にエラーが発生しました:', error);
        // エラー時は初期データを返すなど、安全策をとる
        return false;
    }
}

/**
 * 時間割データを更新する関数
 * @param {Object} courseInformationIncludeTimeJson - コース情報と時間情報を含むJSONオブジェクト
 * @returns {Promise<boolean>} 更新が成功したかどうかの真偽値
 */
export async function deleteTimetableAtStorage(courseInformationIncludeTimeJson) {
    let result = window.confirm(
        "時間割表のデータを削除します。削除したデータは復元できません。(コース自体が消えることはありません。)\nそれでも削除しますか？");
    if (result) {
        console.log(courseInformationIncludeTimeJson);
        try {
            const result = await chrome.storage.sync.get('myUniversityTimetable');
            let timetableData = result.myUniversityTimetable;
            if (!timetableData) {
                console.log("時間割データを読み込めませんでした。");
                return false;
                // 初回読み込み時に初期データを保存しておくことも可能 (任意)
                // await chrome.storage.sync.set({ 'myUniversityTimetable': timetableData });
            } else {
                console.log("localStorageから時間割データを読み込みました:", timetableData);
                courseInformationIncludeTimeJson.times.forEach((timeJson) => {
                    timetableData[timeJson.day][timeJson.period]["name"] = "";
                    timetableData[timeJson.day][timeJson.period]["link"] = "";
                    timetableData[timeJson.day][timeJson.period]["courseID"] = null;
                });
                // オブジェクトのキーと値のペアで保存
                // { '保存キー': 保存したい値 }
                await chrome.storage.sync.set({ 'myUniversityTimetable': timetableData });
            }
        } catch (error) {
            console.error('時間割の読み込み中にエラーが発生しました:', error);
            // エラー時は初期データを返すなど、安全策をとる
            return false;
        }
    }else{
        console.log("時間割の削除がキャンセルされました。");
    }
}

/**
 * timetable_jsonを元に時間割のHTML要素を作成する関数
 * @param {*} time_table_json tableのデータを含むJSONオブジェクト
 * @returns table要素
 */
function create_timetable(time_table_json) {
    let time_table = document.createElement("table");
    time_table.setAttribute("class", "customiseTimetable")


    //曜日作成
    let tr_day = document.createElement("tr");
    let tr_1 = document.createElement("tr");
    let tr_2 = document.createElement("tr");
    let tr_3 = document.createElement("tr");
    let tr_4 = document.createElement("tr");
    let tr_5 = document.createElement("tr");
    let tr_6 = document.createElement("tr");

    tr_day.innerHTML = "<th>時限</th><td>月曜</td><td>火曜</td><td>水曜</td><td>木曜</td><td>金曜</td>";
    tr_1.innerHTML = '<th>1限<br><span class="class_time">08:50~10:20</span></th>';
    tr_2.innerHTML = '<th>2限<br><span class="class_time">10:30~12:00</span></th>';
    tr_3.innerHTML = '<th>3限<br><span class="class_time">13:00~14:30</span></th>';
    tr_4.innerHTML = '<th>4限<br><span class="class_time">14:40~16:10</span></th>';
    tr_5.innerHTML = '<th>5限<br><span class="class_time">16:20~17:50</span></th>';
    tr_6.innerHTML = '<th>6限<br><span class="class_time">18:00~19:30</span></th>';

    //時間割を挿入(一日ごとに挿入)
    let day = ["mon", "tue", "wed", "thu", "fri"]
    let trs = [tr_1, tr_2, tr_3, tr_4, tr_5, tr_6]
    for (let i = 0; i < 5; i++) { //日付
        for (let j = 0; j < 6; j++) { //時限
            let date_class_data = time_table_json[day[i]][j + 1]
            if (date_class_data) {
                let date_class_element = `<td><a href="${date_class_data.link}"><span class="courseLink">${date_class_data.name}</span></a></td>`;
                trs[j].innerHTML += date_class_element;
            }
        }
    }

    //最後の仕上げ　いろいろ挿入
    time_table.appendChild(tr_day);
    for (let i = 0; i < 6; i++) {
        time_table.appendChild(trs[i]);
    }

    return time_table;
}

/** コースページ上の時間割を更新する関数 */
export async function updateTimetable() {
    let timetable_json = await loadTimetableFromStorage();
    let timetable = document.querySelector("#div_TT_TableDiv .customiseTimetable");
    if (timetable) { timetable.remove(); }

    let tableDiv = document.querySelector("#div_TT_TableDiv");
    tableDiv.appendChild(create_timetable(timetable_json));
    console.log("時間割表を更新しました")
}

/**
 * 時間割の編集ボタンを含むdiv要素を作成する関数
 * @returns 時間割の編集ボタンを含むdiv要素
 */
function createManualEditDiscription() {
    const div = document.createElement("div");
    div.setAttribute("class", "timetableEditButtonDiv");

    /* リセット */
    const resetButton = document.createElement("button");
    resetButton.innerHTML = "リセット";
    resetButton.setAttribute("class", "timetable-edit-button timetable-edit-button--reset");
    div.appendChild(resetButton);
    resetButton.addEventListener("click", (e) => {
        resetTimetableFromStorage();
    });

    /* 編集ボタン */
    const editButton = document.createElement("button");
    editButton.innerHTML = "コース名編集";
    editButton.setAttribute("class", "timetable-edit-button timetable-edit-button--edit");
    div.appendChild(editButton);
    editButton.addEventListener("click", (e) => {
        showEditPopup();
    })

    return div;
}


main();

/* 待機して挿入 ------------------------------------------------ */

let intervalID = setInterval(searchElement, 100)
let intervalCount = 0;

function searchElement() {
    let target = document.querySelector("[id^='page-container-'] ul.list-group");

    if (target) {
        console.log("コースリストが見つかりました。");
        clearInterval(intervalID);
        create_custombutton();
        //ボタンにイベントを設定
        setEventTimetableCustomiseButton();
    }

    if (intervalCount > 300) { /* 30秒たっても見つからない場合はタイムアウトする */
        console.log("コースリスト発見関数がタイムアウトしました。");
        clearInterval(intervalID);
    }
    intervalCount++;
}

function create_custombutton() {
    let course_ul = document.querySelectorAll("[id^='page-container-'] ul.list-group li");
    course_ul.forEach((course_li) => {

        /* コース名検索 */
        let courseName = '';
        const courseNameSrOnlySpan = course_li.querySelector('span[data-region="favourite-icon"] + span.sr-only');
        if (courseNameSrOnlySpan) {
            // sr-only spanの次の兄弟ノードが目的のテキストノードです
            let nextNode = courseNameSrOnlySpan.nextSibling;
            //console.log(nextNode);
            // nextNode が存在し、それがテキストノードであることを確認
            if (nextNode && nextNode.nodeType === Node.TEXT_NODE) {
                courseName = nextNode.textContent.trim(); // 前後の空白を削除
            } else {
                console.log('目的のコース名テキストノードが見つかりませんでした。');
            }
        } else {
            console.log('セレクタに一致する要素が見つかりませんでした。');
        }

        /* コースid検索 */
        let courseID = course_li.getAttribute("data-course-id");
        //console.log(`コース名: ${courseName}\nコースid :${courseID}`);

        /* リンク検索 */
        let courseLink = course_li.querySelector("a").getAttribute("href");


        let courseButtonLi = course_li.querySelector(".ml-auto .dropdown-menu");
        /* 追加ボタン作成 */
        let setTimetableButton = document.createElement("button");
        setTimetableButton.setAttribute("class", "dropdown-item addCourseToTimetable");
        setTimetableButton.setAttribute("data-action", "set-course-timetable");
        setTimetableButton.setAttribute("data-course-id", courseID);
        setTimetableButton.setAttribute("data-course-name", courseName);
        setTimetableButton.setAttribute("data-course-link", courseLink);
        setTimetableButton.innerHTML = "時間割に登録";
        courseButtonLi.appendChild(setTimetableButton);
        /* 削除ボタン作成 
        let deleteTimetableButton = document.createElement("button");
        deleteTimetableButton.setAttribute("class", "dropdown-item deleteCourseToTimetable");
        deleteTimetableButton.setAttribute("data-action", "delete-course-timetable");
        deleteTimetableButton.setAttribute("data-course-id", courseID);
        deleteTimetableButton.setAttribute("data-course-name", courseName);
        deleteTimetableButton.setAttribute("data-course-link", courseLink);
        deleteTimetableButton.innerHTML = "時間割から削除";
        courseButtonLi.appendChild(deleteTimetableButton);
        削除はコース名編集から行うのでボツ */
    })
}