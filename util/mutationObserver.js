/**
 * 新しい要素の出現を監視し、出現したら処理を実行する関数
 * @param {string} targetSelector - 監視したい要素のセレクタ（例: '.new-content-area', '#modal-wrapper'）
 * @param {function(Element): void} callback - 新しい要素が出現したときに実行したい処理
 * @param {Element} [rootElement=document.body] - 監視を開始する親要素（通常はdocument.body全体）
 * @param {boolean} - ログを残すかどうか（デフォルトはfalseでログを残さない）
 */
function observeElementAppearance(targetSelector, callback, rootElement = document.body, logToggle = false) {
    // 1. 監視対象の要素がすでに出現しているかを確認
    const existingElement = rootElement.querySelector(targetSelector);
    if (existingElement) {
        callback(existingElement);
        // すでに存在する場合は監視を続行する必要がなければここで終了
        if (logToggle) console.log(`observeElementAppearance: ${targetSelector} はすでに存在しています。`);
        return; 
    }

    // 2. DOMの変更を監視するObserverを作成
    const observer = new MutationObserver((mutationsList, observer) => {
        // 変更リストをループして、追加されたノードの中に目的の要素があるかを確認
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // 追加されたノードすべてに対して処理を行う
                mutation.addedNodes.forEach(node => {
                    // nodeが要素であるか、また目的のセレクタにマッチするかを確認
                    if (node.nodeType === 1 && node.matches(targetSelector)) {
                        observer.disconnect(); // 目的の要素が見つかったので監視を停止
                        callback(node);          // コールバック関数を実行
                        if (logToggle) console.log(`observeElementAppearance: ${targetSelector} が出現しました。`);
                        return; // forEachを抜ける
                    }
                    // 子孫要素として目的の要素が出現する可能性があるため、その中も探す
                    if (node.nodeType === 1 && node.querySelector(targetSelector)) {
                        observer.disconnect(); // 目的の要素が見つかったので監視を停止
                        callback(node.querySelector(targetSelector)); // コールバック関数を実行
                        if (logToggle) console.log(`observeElementAppearance: ${targetSelector} が出現しました。`);
                        return; // forEachを抜ける
                    }
                });
            }else{
                if (logToggle) console.log(`observeElementAppearance: ${targetSelector} はまだ出現していません。`);
            }
        }
    });

    // 3. 監視を開始
    const config = { childList: true, subtree: true };
    observer.observe(rootElement, config);
}

module.exports = { observeElementAppearance };