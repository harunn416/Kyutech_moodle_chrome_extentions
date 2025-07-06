/* 保存関数 */
async function customiseCourseJsonFromTimetable() {
    // ポップアップの入力からコース情報を取得
    if (document.querySelector("#courseChangeNameInput").value !== "") {
        const courseName = document.querySelector("#courseChangeNameInput").value;
        const courseID = document.querySelector("#courseEditNameDiv").dataset.courseId;
        const courseLink = document.querySelector("#courseEditNameDiv").dataset.courseLink;
        const day = document.querySelector("#courseEditNameDiv").dataset.day;
        const period = document.querySelector("#courseEditNameDiv").dataset.period;

        let courseInformationIncludeTimeJson = {
            "times": [{ "day": day, "period": period }],
            "courseInformation": {
                "name": courseName,
                "courseID": courseID,
                "link": courseLink
            }
        }
        await appdateTimetableFromStorage(courseInformationIncludeTimeJson);
        updateTimetable()
        document.querySelector("#courseEditNameDiv").style.display = "none"; // コース名編集divを閉じる
        document.querySelector("#courseChangeNameInput").value = ""; // 入力フィールドをクリア
    } else {
        alert("コースを選択してください！");
    }
}

export function createPageEditPopup() {
    //courseInformationJson = { "courseName": "コースネームだよ", "courseID": "0120" };
    // オーバーレイ（背景の暗い部分）
    const overlay = document.createElement('div');
    overlay.id = 'extension-edit-popup-overlay';
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
    popup.id = 'divEditPop_TT';
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
    title.textContent = '時間割を編集';
    popup.appendChild(title);

    //テーブル説明
    const tableDescripsion = document.createElement("div");
    tableDescripsion.innerHTML = "<span>編集したいコースを選んでね！</span>";
    tableDescripsion.style.margin = "20px 5% 5px 5%";
    tableDescripsion.style.fontSize = "20px";
    tableDescripsion.style.width = "90%";
    popup.appendChild(tableDescripsion);


    //テーブルのはいる場所
    let timetableDiv = document.createElement("div");
    timetableDiv.setAttribute("id", "timetableDivEditPopup");
    popup.appendChild(timetableDiv);

    //コース編集
    const courseEditNameDiv = document.createElement("div");
    courseEditNameDiv.setAttribute("id", "courseEditNameDiv");
    courseEditNameDiv.style.display = "none"; // 初期状態では非表示
    courseEditNameDiv.style.margin = "20px 5% 10px 5%";
    courseEditNameDiv.style.width = "90%";

    const courseEditNameTitle = document.createElement("h5");
    courseEditNameTitle.textContent = "コース名を編集できるよ！";
    courseEditNameTitle.style.marginBottom = "10px";
    courseEditNameDiv.appendChild(courseEditNameTitle);

    const courseEditNameDayAndPeriod = document.createElement("div");
    courseEditNameDayAndPeriod.style.display = "flex";
    courseEditNameDayAndPeriod.style.justifyContent = "flex-start";
    courseEditNameDayAndPeriod.fontSize = "18px";
    courseEditNameDayAndPeriod.style.marginLeft = "10px";
    courseEditNameDayAndPeriod.innerHTML = "<span>◎<span id='courseEditDay'></span>曜日</span><span><span id='courseEditPeriod'></span>限目</span>";
    courseEditNameDiv.appendChild(courseEditNameDayAndPeriod);

    const courseEditNameInputLabel = document.createElement("label");
    courseEditNameInputLabel.setAttribute("for", "courseChangeNameInput");
    courseEditNameInputLabel.innerHTML = "<nobr>コース名:</nobr>";
    courseEditNameInputLabel.style.display = "flex";
    courseEditNameInputLabel.style.alignItems = "center";
    courseEditNameInputLabel.style.marginRight = "10px";
    courseEditNameInputLabel.style.fontSize = "16px";
    const courseEditNameInput = document.createElement("input");
    courseEditNameInput.setAttribute("type", "input");
    courseEditNameInput.setAttribute("id", "courseChangeNameInput");
    courseEditNameInput.style.width = "100%";
    courseEditNameInputLabel.appendChild(courseEditNameInput);
    courseEditNameDiv.appendChild(courseEditNameInputLabel);
    popup.appendChild(courseEditNameDiv);


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
        customiseCourseJsonFromTimetable()
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
    closeButton.addEventListener('click', hideEditPopup);
    overlay.addEventListener('click', hideEditPopup); // オーバーレイをクリックしても閉じる
}

function hideEditPopup() {
    document.querySelector("#extension-edit-popup-overlay").style.display = 'none';
    document.querySelector("#divEditPop_TT").style.display = 'none';
}

// ポップアップを表示する関数
export function showEditPopup() {
    document.querySelector("#extension-edit-popup-overlay").style.display = 'block';
    document.querySelector("#divEditPop_TT").style.display = 'block';

    insertCoursesInTimetableEdit();
}

async function insertCoursesInTimetableEdit() {
    //初期化
    let customiseTable = document.querySelector("#divEditPop_TT table");
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
            if (date_class_data["name"] != "") {
                let date_class_element = document.createElement("td");

                let date_class_element_a = document.createElement("a");
                date_class_element_a.setAttribute("href", "#");
                date_class_element_a.setAttribute("class", "courseEditLink");

                let date_class_element_span = document.createElement("span");
                date_class_element_span.setAttribute("class", "course-edit-link courseLink");
                date_class_element_span.dataset.courseName = date_class_data["name"];
                date_class_element_span.dataset.courseId = date_class_data["courseID"];
                date_class_element_span.dataset.courseLink = date_class_data["link"];
                date_class_element_span.textContent = date_class_data["name"];

                date_class_element_a.appendChild(date_class_element_span);
                date_class_element.appendChild(date_class_element_a);

                trs[j].appendChild(date_class_element);

                /* 時間割変更ボタンのイベント作成 */
                date_class_element_span.addEventListener("click", (e) => {
                    const clickButtonElem = e.target;
                    const courseName = clickButtonElem.dataset.courseName;
                    const courseID = clickButtonElem.dataset.courseId;
                    const courseLink = clickButtonElem.dataset.courseLink;
                    const courseInformationJson = {
                        "day": day[i],
                        "period": j + 1,
                        "courseName": courseName,
                        "courseID": courseID,
                        "courseLink": courseLink
                    }
                    apeardNameEditPopup(courseInformationJson); //ポップアップを表示
                });
            } else {
                let date_class_element = document.createElement("td");
                trs[j].appendChild(date_class_element);
            }
        }
    }

    //最後の仕上げ　いろいろ挿入
    time_table.appendChild(tr_day);
    for (let i = 0; i < 6; i++) {
        time_table.appendChild(trs[i]);
    }

    document.querySelector("#timetableDivEditPopup").appendChild(time_table);
    //document.querySelector('[id^="block-myoverview-"]').insertBefore(div_TT, document.getElementById(""))
}

function apeardNameEditPopup(courseInformationJson) {
    //コース情報をポップアップに挿入
    document.querySelector("#courseEditNameDiv").style.display = "block";
    document.querySelector("#courseEditNameDiv").setAttribute("data-course-Link", courseInformationJson.courseLink);
    document.querySelector("#courseEditNameDiv").setAttribute("data-course-id", courseInformationJson.courseID);
    document.querySelector("#courseEditNameDiv").setAttribute("data-day", courseInformationJson.day);
    document.querySelector("#courseEditNameDiv").setAttribute("data-period", courseInformationJson.period);

    //曜日と時限とコース名の情報を挿入
    document.querySelector("#courseEditDay").innerHTML = convertDayToJapanese(courseInformationJson.day);
    document.querySelector("#courseEditPeriod").innerHTML = courseInformationJson.period;
    document.querySelector("#courseChangeNameInput").value = courseInformationJson.courseName;

}

function convertDayToJapanese(day) {
    switch (day) {
        case "mon":
            return "月";
        case "tue":
            return "火";
        case "wed":
            return "水";
        case "thu":
            return "木";
        case "fri":
            return "金";
        default:
            return day; // 不明な場合はそのまま返す
    }
}