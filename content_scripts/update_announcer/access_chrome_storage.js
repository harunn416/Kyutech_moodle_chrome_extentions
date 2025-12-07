// 最後にアクセスしたときのバージョンを保存・取得するためのキーを定義
const STORAGE_KEY_LATEST_ACCESSED_VERSION = 'latestAccessedVersion';

/**
 * chrome.storage.sync から最後にアクセスしたときのバージョンの値を取得する。
 * @returns {Promise<any>} 値を解決するプロミス。
 */
export function getStoredLatestAccessedVersion() {
    return new Promise((resolve, regect) => {
        chrome.storage.sync.get([STORAGE_KEY_LATEST_ACCESSED_VERSION], (result) => {
            // 失敗した場合
            if (chrome.runtime.lastError) {
                regect(chrome.runtime.lastError);
                return;
            }
            // 成功した場合
            resolve(result[STORAGE_KEY_LATEST_ACCESSED_VERSION]);
        });
    });
}

/**
 * chrome.storage.sync に最後にアクセスしたときのバージョンの値を保存する。
 * @param {any} version 保存するバージョンの値。
 * @returns {Promise<void>} 保存が完了したことを示すプロミス。
 */
export function setStoredLatestAccessedVersion(version) {
    return new Promise((resolve, regect) => {
        const data = {
            [STORAGE_KEY_LATEST_ACCESSED_VERSION]: version
        };
        chrome.storage.sync.set(data, () => {
            // 失敗した場合
            if (chrome.runtime.lastError) {
                regect(chrome.runtime.lastError);
                return;
            }
            // 成功した場合
            resolve();
        });
    });
}