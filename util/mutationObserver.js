/**
 * 新しい要素の出現を監視し、出現したら処理を実行する関数
 * @param {string} targetSelector - 監視したい要素のセレクタ（例: '.new-content-area', '#modal-wrapper'）
 * @param {function(Element): void} callback - 新しい要素が出現したときに実行したい処理
 * @param {Element} [rootElement=document.body] - 監視を開始する親要素（通常はdocument.body全体）
 * @param {boolean} [logToggle=false] - ログを残すかどうか（デフォルトはfalseでログを残さない）
 * @param {boolean} [continueObserving=false] - コールバック実行後も監視を続けるかどうか（デフォルトはfalseで監視を停止）
 */
export function observeElementAppearance(
    targetSelector,
    callback,
    rootElement = document.body,
    logToggle = false,
    continueObserving = false
) {
    // 1. 監視対象の要素がすでに出現しているかを確認
    const existingElement = rootElement.querySelector(targetSelector);
    if (existingElement) {
        callback(existingElement);
        // すでに存在する場合は、continueObservingがfalseならここで終了
        if (logToggle) console.log(`observeElementAppearance: ${targetSelector} はすでに存在しています。`);
        if (!continueObserving) return;
    }

    // 2. DOMの変更を監視するObserverを作成
    const observer = new MutationObserver((mutationsList, observer) => {
        // 変更リストをループして、追加されたノードの中に目的の要素があるかを確認
        for (const mutation of mutationsList) {
            if (
                mutation.type === "childList" &&
                mutation.addedNodes.length > 0
            ) {
                // 追加されたノードすべてに対して処理を行う
                mutation.addedNodes.forEach((node) => {
                    // node自体か、その子孫にターゲットがあるか確認
                    const targetElement = node.nodeType !== 1 ? null : 
                                        node.matches(targetSelector) ? node : 
                                        node.querySelector(targetSelector);

                    if (targetElement) {
                        if (!continueObserving) observer.disconnect();
                        callback(targetElement);
                        if (logToggle) console.log(`observeElementAppearance: ${targetSelector} が出現しました。`);
                        return;
                    }
                });
            } else {
                if (logToggle) console.log(`observeElementAppearance: ${targetSelector} はまだ出現していません。`);
            }
        }
    });

    // 3. 監視を開始
    const config = { childList: true, subtree: true };
    observer.observe(rootElement, config);
}
