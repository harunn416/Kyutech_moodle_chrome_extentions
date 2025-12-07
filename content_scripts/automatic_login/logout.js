// mutationObserver ユーティリティ読み込み
import { observeElementAppearance } from "../../util/mutationObserver.js";

/* ログアウトボタンにユーザー情報削除のイベントリスナーを追加する関数 */
export async function addEventListenerToLogoutButtonAndClearUserInfo(){
    if(await isUserInfoStored()) {
        observeElementAppearance("nav div#usernavigation div#user-action-menu a.dropdown-item[href*='logout.php']", (logoutButton)=>{
            logoutButton.addEventListener("click", async (e)=>{
                try {
                    await chrome.storage.sync.remove("automaticLoginUserInfo");
                    console.log("ユーザー情報が削除されました。");
                } catch (error) {
                    console.error("ユーザー情報の削除に失敗しました:", error);
                }
            });
        })
    } else {
        console.log("ユーザー情報は保存されていません。");
    }
}

/* 拡張機能のストレージにユーザー情報が保存されているか確認する関数 */
async function isUserInfoStored(){
    try {
        const result = await chrome.storage.sync.get("automaticLoginUserInfo");
        return result.automaticLoginUserInfo !== undefined
    } catch (error) {
        console.error("ユーザー情報の取得に失敗しました:", error);
        return false;
    }
}