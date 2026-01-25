/** 課題URLからコースリンクを取得する関数
 * @param {string} URL - 課題のURL
 * @returns {Promise<string|null>} - コースリンクのURLまたはnull
*/
export async function getCourseLink(URL) {
    const response = await fetch(URL);

    // ステータスコードの確認
    if (!response.ok) throw new Error(`HTTPエラー! ステータス: ${response.status}`);

    // HTMLコンテンツの取得とパース
    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // コースリンクの抽出
    const courseLinkElement = doc.querySelector('div#page div#topofscroll header#page-header div#page-navbar ol a');
    if (!courseLinkElement) throw new Error('コースリンクが見つかりませんでした。');
    const courseHref = courseLinkElement.getAttribute('href');

    if (!courseHref) return null;
    return courseHref;
}