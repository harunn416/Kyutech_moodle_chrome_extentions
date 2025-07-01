// content.js
/* 保存関数 */
async function appdateCourseJsonFromTimetable() {
    let times = [];

    const courseName = document.querySelector("#courseNameInput").value;
    const courseID = document.querySelector("#inputCourseId").innerHTML;
    const courseLink = document.querySelector("#divAddPop_TT").getAttribute("data-course-Link");

    const courseSelectCheckboxes = document.querySelectorAll("input.checkboxTimeschedule[type='checkbox']");
    courseSelectCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            let day = checkbox.dataset.day;
            let period = checkbox.dataset.period;
            times.push({"day":day,"period":period});
        }
    });
    let courseInformationIncludeTimeJson = {
        "times": times,
        "courseInformation": {
            "name": courseName,
            "courseID": courseID,
            "link": courseLink
        }
    }
    await appdateTimetableFromStorage(courseInformationIncludeTimeJson);
    hideAddPopup()
    updateTimetable()
}

// --- 1. ポップアップのHTML構造を作成する関数 ---

function createPageAddPopup() {
    //courseInformationJson = { "courseName": "コースネームだよ", "courseID": "0120" };
    // オーバーレイ（背景の暗い部分）
    const overlay = document.createElement('div');
    overlay.id = 'extension-add-popup-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // 半透明の黒
    overlay.style.zIndex = '10000'; // ページの他の要素より上に来るように高いz-indexを設定
    overlay.style.display = 'none'; // 初期状態では非表示

    // ポップアップ本体
    const popup = document.createElement('div');
    popup.id = 'divAddPop_TT';
    popup.style.position = 'fixed';
    popup.style.width = '70%';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)'; // 中央寄せ
    popup.style.backgroundColor = 'white';
    popup.style.padding = '20px';
    popup.style.border = '1px solid #ccc';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    popup.style.zIndex = '10001'; // オーバーレイよりさらに上
    popup.style.display = 'none'; // 初期状態では非表示
    popup.style.minWidth = '400px'; // 最小幅
    popup.style.boxSizing = 'border-box'; // paddingを幅に含める

    // ポップアップのタイトル
    const title = document.createElement('h3');
    title.textContent = '時間割を追加';
    popup.appendChild(title);

    //コース情報を入れるdiv
    const courseInformationDiv = document.createElement("div");
    courseInformationDiv.style.margin = "20px 5% 10px 5%";
    courseInformationDiv.style.width = "90%";

    //コースネームタイトル, ID
    const courseNameIDDiv = document.createElement("div");
    courseNameIDDiv.style.display = "flex";
    courseNameIDDiv.style.flexDirection = "row";
    courseNameIDDiv.style.justifyContent = "space-between";
    courseNameIDDiv.style.alignItems = "center";

    const courseNameInputTitle = document.createElement("span");
    courseNameInputTitle.style.fontSize = "20px";
    courseNameInputTitle.innerHTML = "<label for='courseNameInput'>コースネーム<span style='font-size: 15px'> (短いほうがおすすめ)</span></label>";

    const courseNameInputID = document.createElement("span");
    courseNameInputID.style.fontSize = "15px";
    courseNameInputID.style.color = "#666";
    courseNameInputID.innerHTML = `<span>コースID: <span  id="inputCourseId"></span></span>`;

    courseNameIDDiv.appendChild(courseNameInputTitle);
    courseNameIDDiv.appendChild(courseNameInputID);

    courseInformationDiv.appendChild(courseNameIDDiv);

    //コースネーム(編集可)
    const courseNameInput = document.createElement("input");
    courseNameInput.setAttribute("type", "input");
    courseNameInput.setAttribute("id", "courseNameInput");
    courseNameInput.setAttribute("name", "courseNameInput");
    courseNameInput.style.width = "100%";
    courseInformationDiv.appendChild(courseNameInput);

    popup.appendChild(courseInformationDiv);

    //テーブル説明
    const tableDescripsion = document.createElement("div");
    tableDescripsion.innerHTML = "<span>追加したい場所にチェックを入れてね！</span>";
    tableDescripsion.style.margin = "20px 5% 5px 5%";
    tableDescripsion.style.width = "90%";
    popup.appendChild(tableDescripsion);


    //テーブルのはいる場所
    let timetableDiv = document.createElement("div");
    timetableDiv.setAttribute("id", "timetableDivAddPopup");
    popup.appendChild(timetableDiv);

    // ボタンコンテナ
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '20px';
    buttonContainer.style.textAlign = 'right';

    // 保存ボタン
    const saveButton = document.createElement('button');
    saveButton.textContent = '保存';
    saveButton.style.padding = '8px 15px';
    saveButton.style.backgroundColor = '#007bff';
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';
    buttonContainer.appendChild(saveButton);
    saveButton.addEventListener("click", (e) => {
        appdateCourseJsonFromTimetable()
    });

    // 閉じるボタン
    const closeButton = document.createElement('button');
    closeButton.textContent = '閉じる';
    closeButton.style.marginLeft = '10px';
    closeButton.style.padding = '8px 15px';
    closeButton.style.backgroundColor = '#6c757d';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    buttonContainer.appendChild(closeButton);

    popup.appendChild(buttonContainer);

    // ボディにオーバーレイとポップアップを追加
    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    // 閉じるボタンとオーバーレイのクリックイベント
    closeButton.addEventListener('click', hideAddPopup);
    overlay.addEventListener('click', hideAddPopup); // オーバーレイをクリックしても閉じる
}

// ポップアップを表示する関数
function showAddPopup(courseInformationJson) {
    document.querySelector("#extension-add-popup-overlay").style.display = 'block';
    document.querySelector("#divAddPop_TT").style.display = 'block';

    document.querySelector("#courseNameInput").value = courseInformationJson.courseName;
    document.querySelector("#inputCourseId").innerHTML = courseInformationJson.courseID;
    document.querySelector("#divAddPop_TT").setAttribute("data-course-Link", courseInformationJson.courseLink);

    insertCoursesInTimetable();
}

// ポップアップを非表示にする関数
function hideAddPopup() {
    document.querySelector("#extension-add-popup-overlay").style.display = 'none';
    document.querySelector("#divAddPop_TT").style.display = 'none';
}


async function insertCoursesInTimetable() {
    //初期化
    let customiseTable = document.querySelector("#divAddPop_TT table");
    if (customiseTable) {
        customiseTable.remove();
    }
    // 時間割の選択UI
    let time_table_json = await loadTimetableFromStorage();
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
    let day = ["mon", "tue", "wed", "thu", "fri"];
    let trs = [tr_1, tr_2, tr_3, tr_4, tr_5, tr_6];
    for (let i = 0; i < 5; i++) { //日付
        for (let j = 0; j < 6; j++) { //時限
            let date_class_data = time_table_json[day[i]][j + 1];
            if (!(date_class_data["name"] == "")) {
                let date_class_element = `<td><span class="courseLink">${date_class_data.name}</span></td>`;
                trs[j].innerHTML += date_class_element;
            } else {
                let date_class_element = `<td><input type="checkbox" data-day=${day[i]} data-period=${j+1} class="checkboxTimeschedule"></td>`;
                trs[j].innerHTML += date_class_element;
            }
        }
    }

    //最後の仕上げ　いろいろ挿入
    time_table.appendChild(tr_day);
    for (let i = 0; i < 6; i++) {
        time_table.appendChild(trs[i]);
    }

    document.querySelector("#timetableDivAddPopup").appendChild(time_table);
    //document.querySelector('[id^="block-myoverview-"]').insertBefore(div_TT, document.getElementById(""))
}

/* 時間割変更ボタンのイベント作成 */
function setEventTimetableCustomiseButton() {
    const allTimetableCustomiseButton = document.querySelectorAll("button.addCourseToTimetable");

    allTimetableCustomiseButton.forEach(addButton => {
        addButton.addEventListener("click", (e) => {
            const clickButtonElem = e.target;
            const courseName = clickButtonElem.dataset.courseName;
            const courseID = clickButtonElem.dataset.courseId;
            const courseLink = clickButtonElem.dataset.courseLink;
            const courseInformationJson = {
                "courseName": courseName,
                "courseID": courseID,
                "courseLink": courseLink
            }
            showAddPopup(courseInformationJson);
        });
    });
}