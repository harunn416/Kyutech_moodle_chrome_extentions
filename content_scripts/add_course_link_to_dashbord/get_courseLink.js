/** 課題URLからコースリンクを取得する関数
 * @param {string} assignmentID - 課題ID
 * @param {string} URL - 課題のURL
 * @returns {Promise<string|null>} - コースリンクのURLまたはnull
*/
export async function getCourseLink(assignmentID, URL, onErrorCallback = null) {
    const response = await fetch(URL);
    
    // ステータスコードの確認
    if (!response.ok) {
        if (onErrorCallback) onErrorCallback();
        throw new Error(`HTTPエラー! ステータス: ${response.status}`);
    }
    
    // HTMLコンテンツの取得とパース
    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    
    // リダイレクトされたDOMがコースの場合、そのURLを返す
    if (doc.body.id.includes('course-view')) return response.url + `#module-${assignmentID}`;

    // コースリンクの抽出
    const courseLinkElement = doc.querySelector('div#page div#topofscroll header#page-header div#page-navbar ol a');
    if (!courseLinkElement) {
        if (onErrorCallback) onErrorCallback();
        throw new Error('コースリンクが見つかりませんでした。');
    }
    const courseHref = courseLinkElement.getAttribute('href');

    if (!courseHref) return null;
    return courseHref;
}