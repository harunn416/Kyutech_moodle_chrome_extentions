window.addEventListener("load", main, false);

function add_css(){
    var head = document.head;
    var linkElement = document.createElement("link");

    linkElement.type = "text/css";
    linkElement.rel = "stylesheet";
    linkElement.href = chrome.runtime.getURL("src/style_sheet.css");

    head.appendChild(linkElement);
}

// 初期状態の空の時間割データ構造を定義
const initialTimetableData = {
    "mon": {
        "1": { "name": "", "link": "" }, "2": { "name": "", "link": "" }, "3": { "name": "", "link": "" },
        "4": { "name": "", "link": "" }, "5": { "name": "", "link": "" }, "6": { "name": "", "link": "" }
    },
    "tue": {
        "1": { "name": "", "link": "" }, "2": { "name": "", "link": "" }, "3": { "name": "", "link": "" },
        "4": { "name": "", "link": "" }, "5": { "name": "", "link": "" }, "6": { "name": "", "link": "" }
    },
    "wed": {
        "1": { "name": "", "link": "" }, "2": { "name": "", "link": "" }, "3": { "name": "", "link": "" },
        "4": { "name": "", "link": "" }, "5": { "name": "", "link": "" }, "6": { "name": "", "link": "" }
    },
    "thu": {
        "1": { "name": "", "link": "" }, "2": { "name": "", "link": "" }, "3": { "name": "", "link": "" },
        "4": { "name": "", "link": "" }, "5": { "name": "", "link": "" }, "6": { "name": "", "link": "" }
    },
    "fri": {
        "1": { "name": "", "link": "" }, "2": { "name": "", "link": "" }, "3": { "name": "", "link": "" },
        "4": { "name": "", "link": "" }, "5": { "name": "", "link": "" }, "6": { "name": "", "link": "" }
    }
};

//データを取得
async function loadTimetableFromStorage() {
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
            } catch (error) {
                console.error('新規データの保存に失敗しました:', error);
            }
            // 初回読み込み時に初期データを保存しておくことも可能 (任意)
            // await chrome.storage.sync.set({ 'myUniversityTimetable': timetableData });
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

//retuen html_table
function create_timetable(time_table_json) {
    let div_TT = document.createElement("div");
    div_TT.setAttribute("id", "div_TT");
    let time_table = document.createElement("table");

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
    let day = ["mon","tue","wed","thu","fri"]
    let trs = [tr_1,tr_2,tr_3,tr_4,tr_5,tr_6]
    for (let i=0; i<5; i++) { //日付
        for(let j=0; j<6; j++){ //時限
            let date_class_data = time_table_json[day[i]][j+1]
            let date_class_element = `<td><a href="${date_class_data.link}">${date_class_data.name}</a></td>`
            trs[j].innerHTML += date_class_element;
        }
    }

    //最後の仕上げ　いろいろ挿入
    time_table.appendChild(tr_day);
    for(let i=0; i<6; i++){
        time_table.appendChild(trs[i]);
    }

    div_TT.appendChild(time_table)
    //document.querySelector('[id^="block-myoverview-"]').insertBefore(div_TT, document.getElementById(""))
    return div_TT;
}

async function main(e) {
    add_css()
    //document.getElementById("instance-5-header").innerHTML = "コース概要ううううう～～～～↑"
    let timetable_json = await loadTimetableFromStorage();
    let div_TT = create_timetable(timetable_json)
    document.getElementById("instance-5-header").appendChild(div_TT);

}