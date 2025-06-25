// content.js

// --- 1. ポップアップのHTML構造を作成する関数 ---
function createPagePopup() {
    // オーバーレイ（背景の暗い部分）
    const overlay = document.createElement('div');
    overlay.id = 'extension-popup-overlay';
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
    popup.id = 'div_TT';
    popup.style.position = 'fixed';
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
    popup.style.minWidth = '300px'; // 最小幅
    popup.style.maxWidth = '500px'; // 最大幅
    popup.style.boxSizing = 'border-box'; // paddingを幅に含める

    // ポップアップのタイトル
    const title = document.createElement('h3');
    title.textContent = '時間割編集';
    popup.appendChild(title);

    // 時間割の選択UI
        let time_table_json = loadTimetableFromStorage();
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
        let day = ["mon", "tue", "wed", "thu", "fri"];
        let trs = [tr_1, tr_2, tr_3, tr_4, tr_5, tr_6];
        for (let i = 0; i < 5; i++) { //日付
            for (let j = 0; j < 6; j++) { //時限
                let date_class_data = time_table_json[day[i]][j + 1];
                if()
                let date_class_element = `<td>${date_class_data.name}</td>`;
                trs[j].innerHTML += date_class_element;
            }
        }

        //最後の仕上げ　いろいろ挿入
        time_table.appendChild(tr_day);
        for (let i = 0; i < 6; i++) {
            time_table.appendChild(trs[i]);
        }

        div_TT.appendChild(time_table)
        //document.querySelector('[id^="block-myoverview-"]').insertBefore(div_TT, document.getElementById(""))

    // ボタンコンテナ
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '20px';
    buttonContainer.style.textAlign = 'right';

    // 保存ボタン
    const saveButton = document.createElement('button');
    saveButton.id = 'extension-popup-save-btn';
    saveButton.textContent = '保存';
    saveButton.style.padding = '8px 15px';
    saveButton.style.backgroundColor = '#007bff';
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';
    buttonContainer.appendChild(saveButton);

    // 閉じるボタン
    const closeButton = document.createElement('button');
    closeButton.id = 'extension-popup-close-btn';
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

    // --- 2. イベントリスナーの設定と機能の実装 ---
    const courseCheckboxes = courseList.querySelectorAll('input[type="checkbox"]');
    const SAVE_KEY = 'myScheduleCourses';

    // 保存された時間割データをロードして、チェックボックスの状態を復元
    chrome.storage.local.get([SAVE_KEY], (result) => {
        const savedCourses = result[SAVE_KEY] || [];
        courseCheckboxes.forEach(checkbox => {
            if (savedCourses.includes(checkbox.value)) {
                checkbox.checked = true;
            }
        });
    });

    // 保存ボタンのクリックイベント
    saveButton.addEventListener('click', () => {
        const selectedCourses = [];
        courseCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedCourses.push(checkbox.value);
            }
        });

        chrome.storage.local.set({ [SAVE_KEY]: selectedCourses }, () => {
            console.log('時間割が保存されました:', selectedCourses);
            alert('時間割が保存されました！');
            hidePopup(); // 保存後にポップアップを非表示にする
            // ここで、保存したデータをページ上の時間割に反映させるロジックを呼び出す
            updatePageScheduleDisplay(selectedCourses);
        });
    });

    // 閉じるボタンとオーバーレイのクリックイベント
    closeButton.addEventListener('click', hidePopup);
    overlay.addEventListener('click', hidePopup); // オーバーレイをクリックしても閉じる

    // ポップアップを表示する関数
    function showPopup() {
        overlay.style.display = 'block';
        popup.style.display = 'block';
    }

    // ポップアップを非表示にする関数
    function hidePopup() {
        overlay.style.display = 'none';
        popup.style.display = 'none';
    }

    // --- 3. ページ上の時間割表示を更新する関数 (例) ---
    // ここは実際のウェブページのHTML構造に合わせて実装します
    function updatePageScheduleDisplay(selectedCourses) {
        // 例: ページ上のどこかに「あなたの選択科目: 」として表示する場合
        let displayArea = document.getElementById('my-schedule-display-area');
        if (!displayArea) {
            displayArea = document.createElement('div');
            displayArea.id = 'my-schedule-display-area';
            displayArea.style.border = '1px dashed #007bff';
            displayArea.style.padding = '10px';
            displayArea.style.margin = '20px 0';
            document.body.appendChild(displayArea);
        }
        if (selectedCourses.length > 0) {
            displayArea.innerHTML = '<h4>あなたの選択科目:</h4>' + selectedCourses.map(course => `<p>- ${course}</p>`).join('');
        } else {
            displayArea.innerHTML = '<p>選択された科目はありません。</p>';
        }
    }

    // ここで、ページ上にポップアップを開くトリガーとなるボタンを追加します
    // 例えば、時間割表の近くに「時間割編集」ボタンを追加する場合
    const editTriggerButton = document.createElement('button');
    editTriggerButton.textContent = '時間割を編集';
    editTriggerButton.style.position = 'fixed';
    editTriggerButton.style.top = '100px';
    editTriggerButton.style.right = '20px';
    editTriggerButton.style.zIndex = '9999';
    editTriggerButton.style.padding = '10px 15px';
    editTriggerButton.style.backgroundColor = '#28a745';
    editTriggerButton.style.color = 'white';
    editTriggerButton.style.border = 'none';
    editTriggerButton.style.borderRadius = '5px';
    editTriggerButton.style.cursor = 'pointer';

    editTriggerButton.addEventListener('click', showPopup);

    // ページロード後に編集トリガーボタンを追加
    // MutationObserverを使用している場合は、適切なタイミングでこれを呼び出す
    document.body.appendChild(editTriggerButton);

    // 初期表示時に、保存されている時間割データをページに反映
    chrome.storage.local.get([SAVE_KEY], (result) => {
        updatePageScheduleDisplay(result[SAVE_KEY] || []);
    });
}

// ページが完全に読み込まれてからポップアップ機能を作成
document.addEventListener('DOMContentLoaded', createPagePopup);

// もし、動的にロードされるコンテンツに対応するために MutationObserver を使っている場合、
// その `findAndManipulateElements` のような関数の中で、
// `createPagePopup()` を呼び出すように調整できます。
// ただし、ポップアップの要素は一度だけ作成・追加すれば良いので、
// 重複して追加されないように注意してください。（例: IDで存在チェック）
/*
let popupInitialized = false; // ポップアップが初期化済みかどうかのフラグ

function findAndManipulateElements() {
    // ... 目的の要素を見つけるロジック ...
    const specificElement = document.querySelector('セレクタ'); // 時間割表の特定の要素など

    if (specificElement && !popupInitialized) {
        createPagePopup(); // ポップアップの作成と設定を一度だけ実行
        popupInitialized = true;
        return true; // 処理完了
    }
    return false; // まだ見つかっていないか、既に初期化済み
}
// MutationObserver の設定（前回の回答参照）
// observer.observe(document.body, config);
// 初期実行時にも findAndManipulateElements() を呼び出す
*/