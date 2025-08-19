// css を読み込む
import "./content.css";

main();
function main() {
    createKeyForStrage(); // キー生成
    // ページ読み込み時に拡張機能のコンフィグ画面を設定。
    createListOparateButton(); //オプション出現ボタン
    createPopupOperateFeatures(); //オプションページ
}

/** 機能のオンオフを管理するキーをブラウザのストレージに作成
 * * キーの名前は "toggle_[機能名(config.jsonのkey)]"
*/
async function createKeyForStrage() {
    //機能一覧を取得
    const featureArray = await getFeatureConfigListArray();

    featureArray.forEach((feature) => {
        chrome.storage.sync.get(["toggle_" + feature.key], (result) => {
            // キーがなければ作成
            if (result["toggle_" + feature.key] === undefined) {
                let key = { ["toggle_" + feature.key]: feature.initialState };
                chrome.storage.sync.set(key);
                console.log("機能管理用のキーを作成しました。", key);
            }
        });
    });
}

/** 上のリストの中に拡張機能設定用のボタンを作成 */
function createListOparateButton() {
    //親要素
    const parentElement = document.querySelector("nav.navbar div.primary-navigation ul[role='menubar']");

    //リスト
    const listOparateButton = document.createElement("li");
    listOparateButton.setAttribute("class", "nav-item");
    listOparateButton.setAttribute("data-forceintomoremenu", "false");
    listOparateButton.addEventListener("click", (e) => { appearedOparatePopup() }); //クリック時にコンフィグ要素を出現

    // リストの中のaタグ
    const aListOparateButton = document.createElement("a");
    aListOparateButton.style.textAlign = "center";
    aListOparateButton.setAttribute("class", "nav-link");
    aListOparateButton.setAttribute("role", "menuitem");
    aListOparateButton.setAttribute("href", "#");
    aListOparateButton.setAttribute("tabindex", "-1");
    aListOparateButton.innerHTML = "Moodle KIT<br>拡張機能設定";

    //それぞれの要素を追加
    listOparateButton.appendChild(aListOparateButton);
    if(parentElement !== null){
        parentElement.appendChild(listOparateButton);
    }else{
        console.log("親要素が見つかりませんでした。");
    }
}

/** 機能一覧の配列を返す関数
 ** 失敗した場合は空の配列を返す
 * @returns {Array} featureListArray 機能一覧の配列
 */
async function getFeatureConfigListArray() {
    const featuresUrl = chrome.runtime.getURL('features.json');
    try {
        const response = await fetch(featuresUrl);
        const data = await response.json();
        return data.features;
    } catch (error) {
        console.error('JSONファイルの読み込みに失敗しました:', error);
        return [];
    }
}

/** 機能一覧のポップアップを表示する関数 */
async function appearedOparatePopup() {
    // 機能のオンオフをトグルに反映する
    const featureArray = await getFeatureConfigListArray();
    //一斉取得のために配列の機能名をキー名に変更
    let featureArrayKey = [];
    for (let i = 0; i < featureArray.length; i++) {
        featureArrayKey.push("toggle_" + featureArray[i]["key"]);
    }
    chrome.storage.sync.get(featureArrayKey, (result) => {
        featureArray.forEach((feature) => {
            const inputElem = document.querySelector("#" + feature["key"] + "_input"); // ポップアップ内の機能のオンオフを管理するトグル
            if (result["toggle_" + feature["key"]]) {
                inputElem.checked = true;
            } else {
                inputElem.checked = false;
            }
        })
    })

    const overlay = document.getElementById('extension-operate-popup-overlay');
    const popup = document.getElementById('extention-operate-popup-div');
    if (overlay && popup) {
        overlay.style.display = 'block'; // オーバーレイを表示
        popup.style.display = 'block'; // ポップアップを表示
    } else {
        console.error("オーバーレイまたはポップアップが見つかりません。");
    }
}

/** 機能一覧のポップアップを非表示にする関数 */
function hideOparatePopup() {
    const overlay = document.getElementById('extension-operate-popup-overlay');
    const popup = document.getElementById('extention-operate-popup-div');
    if (overlay && popup) {
        overlay.style.display = 'none'; // オーバーレイを非表示
        popup.style.display = 'none'; // ポップアップを非表示
    } else {
        console.error("オーバーレイまたはポップアップが見つかりません。");
    }
}

/** ポップアップを作成する関数 */
async function createPopupOperateFeatures() {
    //courseInformationJson = { "courseName": "コースネームだよ", "courseID": "0120" };
    // オーバーレイ（背景の暗い部分）
    const overlay = document.createElement('div');
    overlay.id = 'extension-operate-popup-overlay';
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
    popup.id = 'extention-operate-popup-div';
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
    popup.style.maxWidth = '800px'; // 最大幅
    popup.style.boxSizing = 'border-box'; // paddingを幅に含める

    // ポップアップのタイトル
    const title = document.createElement('h3');
    title.textContent = '機能一覧';
    popup.appendChild(title);

    // ポップアップの説明
    const popupDescription = document.createElement("h5");
    popupDescription.textContent = "ここで機能のオンオフを設定できます。";
    popupDescription.style.marginBottom = "25px";
    popup.appendChild(popupDescription);

    //機能ごとに作成
    const features = await getFeatureConfigListArray();
    features.forEach((featureJson) => {
        // 機能ごとのdiv
        const featureDiv = document.createElement("div");
        featureDiv.setAttribute("class", "feature-item");
        if (featureJson.ForceExecution) { // 強制的に実行させる機能は表示しない
            featureDiv.style.display = "none";
        }
        // トグルとタイトル
        const toggleAndTitleLabel = document.createElement("label");
        toggleAndTitleLabel.setAttribute("class", "toggle-and-title-label");
        const toggleDiv = document.createElement("div");
        toggleDiv.setAttribute("class", "slide_switch");

        const toggle = document.createElement("input");
        toggle.setAttribute("type", "checkbox");
        toggle.setAttribute("id", featureJson.key + "_input");
        toggle.setAttribute("data-feature-key", featureJson.key);
        toggle.addEventListener("click", (e) => {
            chrome.storage.sync.set({ ["toggle_" + e.target.dataset.featureKey]: e.target.checked });
        })
        const toggleCircle = document.createElement("div");
        toggleCircle.setAttribute("class", "circle");
        const toggleBase = document.createElement("div");
        toggleBase.setAttribute("class", "base");
        toggleDiv.appendChild(toggle);
        toggleDiv.appendChild(toggleCircle);
        toggleDiv.appendChild(toggleBase);
        toggleAndTitleLabel.appendChild(toggleDiv);

        const title = document.createElement("h4");
        title.textContent = featureJson.displayName;
        toggleAndTitleLabel.appendChild(title);
        featureDiv.appendChild(toggleAndTitleLabel);

        // 機能説明
        const description = document.createElement("p");
        description.textContent = featureJson.description;
        featureDiv.appendChild(description);

        popup.appendChild(featureDiv);
    });


    // ボタンコンテナ
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '20px';
    buttonContainer.style.textAlign = 'right';

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
    closeButton.addEventListener('click', hideOparatePopup);
    overlay.addEventListener('click', hideOparatePopup); // オーバーレイをクリックしても閉じる
}