// バージョン情報をインポート
import versionInfoArray from '../../version_info.json';
console.log("Latest Version Info:", versionInfoArray[0]);

// Chromeストレージ操作モジュールをインポート
import { getStoredLatestAccessedVersion, setStoredLatestAccessedVersion } from './access_chrome_storage.js';

main();
async function main() {
    // 現在のバージョンを取得
    const currentVersion = "__CURRENT_VERSION_PLACEHOLDER__"; // ビルド時に置換される
    
    console.log("Current Version:", currentVersion);
    
    // 現在保存されている最後にアクセスしたバージョンを取得
    let storedVersion = await getStoredLatestAccessedVersion();
    if (storedVersion === undefined) {
        storedVersion = "1.0.0"; // デフォルト値
    }
    console.log("Stored Latest Accessed Version:", storedVersion);
    
    if (storedVersion !== currentVersion) {
        const popup = createUpdatePopup(storedVersion, currentVersion);
        document.body.appendChild(popup);
        // 現在のバージョンを保存
        await setStoredLatestAccessedVersion(currentVersion);
    }
}


/* 更新情報を表示するポップアップを作成する関数 */
function createUpdatePopup(storedVersion, currentVersion) {
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.bottom = '20px';
    popup.style.left = '20px';
    popup.style.width = '400px';
    popup.style.padding = '15px';
    popup.style.backgroundColor = '#f0f0f0ff';
    popup.style.border = '3px solid #ccc';
    popup.style.borderRadius = '5px';
    popup.style.boxShadow = '#3b3b3b5c 10px 10px 6px';
    popup.style.zIndex = '10000';
    popup.addEventListener('click', () => { {
        popup.remove();
    } });

    const changeVersion = document.createElement("h1")
    changeVersion.textContent = `v${versionInfoArray[1].version} → v${currentVersion}`
    changeVersion.style.color = '#a3006f';
    popup.appendChild(changeVersion);

    const title = document.createElement('h3');
    title.textContent = `拡張機能が更新されました！`;
    popup.appendChild(title);

    const description = document.createElement('p');
    description.textContent = '最新の更新内容';
    description.style.margin = '20px 0 0 0';
    popup.appendChild(description);

    const changeInfo = document.createElement('ul');
    versionInfoArray[0].update_content.forEach(updateInfo => {
        const listItem = document.createElement('li');
        listItem.textContent = updateInfo;
        changeInfo.appendChild(listItem);
    });
    popup.appendChild(changeInfo);

    const closeMessage = document.createElement('p');
    closeMessage.textContent = 'このポップアップはクリックすると閉じます';
    closeMessage.style.fontSize = '0.8em';
    closeMessage.style.color = '#666';
    closeMessage.style.margin = '0';
    popup.appendChild(closeMessage);

    return popup;
}