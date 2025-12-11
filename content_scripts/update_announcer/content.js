// バージョン情報をインポート
import versionInfoArray from '../../version_info.json';
// console.log("Latest Version Info:", versionInfoArray[0]);

// Chromeストレージ操作モジュールをインポート
import { getStoredLatestAccessedVersion, setStoredLatestAccessedVersion } from './access_chrome_storage.js';

main();
async function main() {
    // 現在のバージョンを取得
    const currentVersionPlaceholder = "__CURRENT_VERSION_PLACEHOLDER__"; // ビルド時に置換される
    const currentVersion = versionInfoArray[0].version;

    // バージョンの整合性チェック
    if(currentVersionPlaceholder !== currentVersion ){
        console.warn(`⚠️ 警告: package.json のバージョン (${currentVersionPlaceholder}) と version_info.json の最新バージョン (${versionInfoArray[0].version}) が一致しません。`);
        return;
    }

    // console.log("Current Version:", currentVersion);

    // 現在保存されている最後にアクセスしたバージョンを取得
    let storedVersion = await getStoredLatestAccessedVersion();
    if (storedVersion === undefined) {
        storedVersion = "1.0.0"; // デフォルト値
    }
    // console.log("Stored Latest Accessed Version:", storedVersion);

    if (storedVersion !== currentVersion) {
        console.log(`拡張機能が更新されました: ${storedVersion} → ${currentVersion}`);
        // 更新情報ポップアップを表示
        const popup = createUpdatePopup(storedVersion, currentVersion);
        document.body.appendChild(popup);
    }
}


/* 更新情報を表示するポップアップを作成する関数 */
function createUpdatePopup(storedVersion, currentVersion) {
    // 最新版と一つ前のバージョン情報を取得し、"."で分割する
    const latestVersionDivided = versionInfoArray[0].version.split('.');
    const secondVersionDivided = versionInfoArray[1].version.split('.');

    // ブラウザに保存されていた最後のバージョンに対応する情報を格納した配列を探す
    let storedIndex = -1
    for (let i = 0; i < versionInfoArray.length; i++) {
        if (versionInfoArray[i].version === storedVersion) {
            storedIndex = i;
            break;
        }
    }
    const storedVersionDivided = (storedIndex !== -1) ? versionInfoArray[storedIndex].version.split('.') : [0,0,0];

    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.bottom = '20px';
    popup.style.left = '20px';
    popup.style.width = '400px';
    popup.style.padding = '15px';
    popup.style.backgroundColor = '#f5f5f5ff';
    popup.style.border = '3px solid #ccc';
    popup.style.borderRadius = '5px';
    popup.style.boxShadow = '#3b3b3b5c 10px 10px 6px';
    popup.style.zIndex = '10000';
    popup.addEventListener('click', () => { {
        popup.remove();
        // 現在のバージョンを保存
        setStoredLatestAccessedVersion(currentVersion);
    } });

    const changeVersion = document.createElement("h1")
    changeVersion.textContent = `v${versionInfoArray[storedIndex].version} → v${versionInfoArray[0].version}`
    changeVersion.style.textAlign = 'center';
    // アップデートの重要度に応じて色を変える
    if ( storedVersionDivided[1] !== secondVersionDivided[1] ) {
        changeVersion.style.color = '#a30064ff';
    } else {
        changeVersion.style.color = '#00427f';
    }
    popup.appendChild(changeVersion);

    const title = document.createElement('h3');
    if ( storedVersionDivided[0] !== secondVersionDivided[0] ) {
        title.textContent = `大型アップデートが来ました!!`;
    }else if ( storedVersionDivided[1] !== secondVersionDivided[1] ) {
        title.textContent = `大きな更新がありました！`;
    } else {
        title.textContent = `軽微な更新がありました！`;
    }
    title.style.textAlign = 'center';
    popup.appendChild(title);

    const description = document.createElement('p');
    description.textContent = (storedIndex === 1) ? '最新の更新内容' : '更新内容一覧';
    description.style.margin = '20px 0 2px 10px';
    popup.appendChild(description);

    for (let i=0; i<storedIndex; i++) {
        // もし二番目のバージョンが違うのであれば、そこからは表示しない
        if (latestVersionDivided[1] !== versionInfoArray[i].version.split(".")[1]) break;
        if (storedIndex !== 1) {
            const versionHeader = document.createElement('h4');
            versionHeader.textContent = versionInfoArray[i].version;
            versionHeader.style.margin = '10px 0 4px 0';
            popup.appendChild(versionHeader);
        }
        const changeInfo = document.createElement('ul');
        changeInfo.style.marginBottom = '6px';
        versionInfoArray[i].update_content.forEach(updateInfo => {
            const listItem = document.createElement('li');
            listItem.textContent = updateInfo;
            changeInfo.appendChild(listItem);
        });
        popup.appendChild(changeInfo);
    }

    const closeMessage = document.createElement('p');
    closeMessage.textContent = 'このポップアップはクリックすると閉じます';
    closeMessage.style.textAlign = 'center';
    closeMessage.style.fontSize = '0.8em';
    closeMessage.style.color = '#666';
    closeMessage.style.margin = '0';
    popup.appendChild(closeMessage);

    const progectNameDiv = document.createElement('div');
    progectNameDiv.style.display = 'flex';
    progectNameDiv.style.justifyContent = 'flex-end';
    progectNameDiv.style.alignContent = 'center';
    progectNameDiv.style.margin = '7px 0px -10px 0';

    const logoImg = document.createElement('img');
    logoImg.src = chrome.runtime.getURL('../../assets/icons/icon128.png');
    logoImg.style.width = '19px';
    logoImg.style.filter = 'grayscale(100%) opacity(0.7)';
    logoImg.style.marginRight = '5px';
    progectNameDiv.appendChild(logoImg);

    const progectName = document.createElement('span');
    progectName.textContent = '九工大moodle 拡張機能';
    progectName.style.fontSize = '0.8em';
    progectName.style.color = '#bbbbbbff';
    progectNameDiv.appendChild(progectName);

    popup.appendChild(progectNameDiv);

    return popup;
}