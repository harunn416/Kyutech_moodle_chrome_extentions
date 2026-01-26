// キャッシュを保存するストレージのキー
const STORAGE_KEY = 'COURSE_LINKS_CACHE';
const MAX_CACHE_SIZE = 2;

/** キャッシュを保存する関数
 * @param {string} assignmentID - 課題ID
 * @param {string} courseLink - コースリンクのURL
 */
export async function saveCourseLinkToLocalStorage(assignmentID, courseLink) {
    try {
        // キャッシュを取得
        const storageObject = await chrome.storage.local.get(STORAGE_KEY);
        let courseLinksCache = new Map(storageObject[STORAGE_KEY]) || new Map();

        // キャッシュに新しいコースリンクを追加または更新
        courseLinksCache.set(assignmentID, courseLink);

        // 更新されたキャッシュを保存;
        await chrome.storage.local.set({ [STORAGE_KEY]: Array.from(courseLinksCache.entries()) });
        console.log(`コースリンクが保存されました: ${assignmentID} -> ${courseLink}`);
    } catch (error) {
        console.error('コースリンクの保存に失敗しました:', error);
    }
}

/** キャッシュからコースリンクを取得する関数
 * @param {string} assignmentID - 課題ID
 * @returns {Promise<string|null>} - コースリンクのURL、存在しない場合はnull
 */
export async function getCourseLinkFromLocalStorage(assignmentID) {
    try {
        // キャッシュを取得
        const storageObject = await chrome.storage.local.get(STORAGE_KEY);
        const courseLinksCache = new Map(storageObject[STORAGE_KEY]) || new Map();

        // コースリンクを返す、存在しない場合はnullを返す
        return courseLinksCache.get(assignmentID) || null;
    } catch (error) {
        console.error('コースリンクの取得に失敗しました:', error);
        return null;
    }
}

/** キャッシュの個数が一定量を超えた場合に古いものを削除する関数 */
export async function maintainCacheSizeLimit() {
    try {
        // キャッシュを取得
        const storageObject = await chrome.storage.local.get(STORAGE_KEY);
        let courseLinksCache = new Map(storageObject[STORAGE_KEY]) || new Map();

        // キャッシュの個数が一定量を超えた場合、古いものを削除
        if (courseLinksCache.size > MAX_CACHE_SIZE) {
            while (courseLinksCache.size > MAX_CACHE_SIZE) {
                const oldestKey = courseLinksCache.keys().next().value;
                courseLinksCache.delete(oldestKey);
                console.log(`キャッシュのサイズ制限を維持するため、最も古いエントリを削除しました: ${oldestKey}`);
            }
            await chrome.storage.local.set({ [STORAGE_KEY]: Array.from(courseLinksCache.entries()) });
        }
    } catch (error) {
        console.error('キャッシュサイズの維持に失敗しました:', error);
    }
}