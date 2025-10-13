// 永続化ストレージのキー
const FLAG_STORAGE_KEY = 'first_view_popup_flags';

// 機能ごとのデフォルトフラグ（初回はすべてfalse = ポップアップを表示する）
// ここに新しいフラグが追加されるたびに更新します。
const DEFAULT_FLAGS = {};

/**
 * 1. first_view_popup_flags オブジェクト全体をストレージから取得する
 * ストレージにデータがない場合は、デフォルト値を返します。
 * @returns {Promise<object>} 現在の設定フラグ全体
 */
export async function getFlags() {
    return new Promise((resolve) => {
        // chrome.storage.sync.get にキーを渡して取得
        chrome.storage.sync.get(FLAG_STORAGE_KEY, (data) => {
            // ストレージに保存されているデータ、または空のオブジェクト
            const savedFlags = data[FLAG_STORAGE_KEY] || {};
            
            // デフォルト値と保存値をマージする
            // 既に保存されているフラグはそのまま使い、存在しないキー（新機能）にはデフォルトのfalseが入る
            const mergedFlags = { ...DEFAULT_FLAGS, ...savedFlags };
            
            resolve(mergedFlags);
        });
    });
}

/**
 * 特定の機能ポップアップを今から表示すべきか（フラグが false か）を確認する
 * @param {string} flagKey - 確認したいフラグの名前
 * @returns {Promise<boolean>} ポップアップを表示すべきなら true、そうでなければ false
 */
export async function shouldShowPopup(flagKey) {
    const flags = await getFlags();
    // フラグが false (または undefined でデフォルト値が false) なら true を返す
    return flags[flagKey] === false || flags[flagKey] === undefined;
}

/**
 * 2. 特定のフラグを設定値で更新し、ストレージに保存し直す
 * @param {string} flagKey - 更新したいフラグの名前 (例: 'markdown_popup_v2')
 * @param {boolean} value - 設定したい真偽値 (通常は true)
 * @returns {Promise<void>}
 */
export async function setFlag(flagKey, value) {
    try {
        // 1. 現在の設定フラグ全体を取得
        const currentFlags = await getFlags();
        
        // 2. 変更したいフラグを更新
        currentFlags[flagKey] = value;
        
        // 3. オブジェクト全体を単一キーで保存
        const dataToSave = {};
        dataToSave[FLAG_STORAGE_KEY] = currentFlags;

        await new Promise((resolve, reject) => {
            chrome.storage.sync.set(dataToSave, () => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve();
            });
        });
        
    } catch (error) {
        console.error(`フラグ ${flagKey} の保存に失敗しました:`, error);
        // ここでエラーを再スローするか、無視するかはアプリケーションの要件による
        throw error;
    }
}