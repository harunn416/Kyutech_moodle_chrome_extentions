import { getCourseLink } from "./get_courseLink.js";

/** コースページを開く関数
 * @param {number} assignmentId - コースID
 * @param {string} assignmentLink - コースリンクのURL
 */
export async function openCourseLink(assignmentId, assignmentLink) {
    console.log(`コースID: ${assignmentId} のコースリンクを開きます: ${assignmentLink}`);
    if (assignmentLink) {
        const courseLink = await getCourseLink(assignmentLink);
        openLink(courseLink);
    }
}

function openLink(URL){
    window.open(URL, '_blank');
}