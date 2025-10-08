/*作るべき機能
* メモ一覧を取得する関数(プルダウンメニューに表示するために必要)
  メモを取得する関数
  メモを保存する関数
*/

// 「その他」のメモ用の予約キーを定義（例として、大文字で固定）
const OTHER_NOTES_KEY = "GLOBAL_OTHER_NOTES"; 

// メモデータのキーは 'memo_' プレフィックスで始まる
// メモデータの構造は { title: 'コース名', content: 'メモ内容', isMarkdown: true/false }

/**
 * chrome.storage.local から全てのメモのキーとコース名を取得する
 * @returns {Promise<Array<{key: string, name: string}>>} キーとコース名のペアの配列
 */
export function getMemoList() {
    return new Promise((resolve, reject) => {
        // nullを渡して全てのデータを取得
        chrome.storage.local.get(null, (items) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }

            const memoList = [];

            // 取得した全てのキーをループ処理
            for (const key in items) {
                // 1. メモデータであることを確認（プレフィックスでフィルタリング）
                if (key.startsWith('memo_')) {
                    const memoData = items[key];

                    // 2. コース名 (title) が存在するか確認
                    if (memoData && memoData.title) {
                        memoList.push({
                            key: key,               // 実際のデータ取得に使用するキーID
                            name: memoData.title    // プルダウンに表示するコース名
                        });
                    }
                }
            }

            resolve(memoList);
        });
    });
}

/** メモJSONを取得する関数 
 * @param {string} courseID コースID
 * @returns {Promise<{title: string, content: string, isMarkdown: boolean}>} メモデータ
*/
export function getMemoJson(courseID) {
    // 1. コースIDが存在しない場合（メニューページなど）は、固定キーを使用する
    const key = (courseID && courseID.trim() !== "") 
                ? `memo_${courseId}` // コースIDがある場合は、通常のキーを作成
                : `memo_${OTHER_NOTES_KEY}`; // コースIDがない場合は、「その他」の固定キーを使用
    
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], (result) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
        });
        resolve(result[key]);
    });
}

/** メモJSONを保存する関数
 * @param {string} courseID コースID
 * @param {{title: string, content: string, isMarkdown: boolean}} memoData メモデータ
 * @returns {Promise<void>}
*/
export function saveMemoJson(courseID, memoData) {
    // 1. コースIDが存在しない場合（メニューページなど）は、固定キーを使用する
    const key = (courseID && courseID.trim() !== "")
                ? `memo_${courseId}` // コースIDがある場合は、通常のキーを作成
                : `memo_${OTHER_NOTES_KEY}`; // コースIDがない場合は、「その他」の固定キーを使用
    return new Promise((resolve, reject) => {
        const dataToSave = {};
        dataToSave[key] = memoData;
        chrome.storage.local.set(dataToSave, () => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            resolve();
        });
    });
}