import { getCourseLink } from "./get_courseLink.js";
import { getCourseLinkFromLocalStorage, saveCourseLinkToLocalStorage } from "./operate_storage_local.js";

/** コースページを開く関数
 * @param {number} assignmentId - コースID
 * @param {string} assignmentLink - コースリンクのURL
 */
export async function openCourseLink(assignmentId, assignmentLink) {
    console.log(`コースID: ${assignmentId} のコースリンクを開きます。`);

    // キャッシュからコースリンクを取得
    let courseLink = await getCourseLinkFromLocalStorage(assignmentId);
    if (courseLink) {
        window.open(courseLink, '_blank');
    } else {
        console.log("キャッシュに存在しないため、新たに取得します。");
        const courseLink = await getCourseLink(assignmentLink);
        // 課題IDがない場合は保存しない
        if (assignmentId !== "") saveCourseLinkToLocalStorage(assignmentId, courseLink);
        window.open(courseLink, '_blank');
    }
    
}