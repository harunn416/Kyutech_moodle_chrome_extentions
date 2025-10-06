/*作るべき機能
メモ一覧を取得する関数(プルダウンメニューに表示するために必要)
メモを取得する関数
メモを保存する関数
メモを削除する関数
*/

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
