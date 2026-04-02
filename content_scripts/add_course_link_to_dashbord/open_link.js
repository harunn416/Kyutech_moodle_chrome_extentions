import { getCourseLink } from "./get_courseLink.js";
import { getCourseLinkFromLocalStorage, saveCourseLinkToLocalStorage } from "./operate_storage_local.js";
import { changeButtonDesign } from "./edit_dom.js";

/** コースページを開く関数
 * @param {number} assignmentId - コースID
 * @param {string} assignmentLink - コースリンクのURL
 */
export async function openCourseLink(assignmentId, assignmentLink, buttonElement) {
    // console.log(`コースID: ${assignmentId} のコースリンクを開きます。`);

    // ボタンが読み込み中の場合は何もしない
    if (buttonElement.dataset.isLoading === "true") {
        console.log("現在読み込み中です。しばらくお待ちください。");
        return;
    }

    // キャッシュからコースリンクを取得
    let courseLink = await getCourseLinkFromLocalStorage(assignmentId);
    if (courseLink) {
        window.open(courseLink, '_blank');
    } else {
        console.log("キャッシュに存在しないため、新たに取得します。");
        changeButtonDesign(buttonElement, "loading");
        const courseLink = await getCourseLink(assignmentId, assignmentLink, () => {changeButtonDesign(buttonElement, "error");});
        if (!courseLink) {
            console.error("コースリンクの取得に失敗しました。");
            changeButtonDesign(buttonElement, "error");
            return;
        }
        // 課題IDがない場合は保存しない
        if (assignmentId !== "") saveCourseLinkToLocalStorage(assignmentId, courseLink);
        changeButtonDesign(buttonElement, "standby");
        window.open(courseLink, '_blank');
    }
}