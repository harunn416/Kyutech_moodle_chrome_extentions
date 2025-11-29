/* ストレージから機能のオンオフを読み込んで実行するか判断する部分 *********************/
// この機能に対応するキー名を定義
// キー名はバンドル時に置換される
const FEATURE_KEY = '__FEATURE_KEY_PLACEHOLDER__';

/**
 * この機能が有効になっているかブラウザのストレージから確認する関数
 * @returns {Promise<boolean>} 機能が有効ならtrue、無効ならfalse
 */
async function shouldRun() {
    try {
        const result = await chrome.storage.sync.get("toggle_" + FEATURE_KEY);
        // キーが存在しない場合はtrue（ON）をデフォルトとする
        return result["toggle_" + FEATURE_KEY] !== false;
    } catch (error) {
        console.error(`機能(${FEATURE_KEY})の有効/無効状態の取得に失敗しました:`, error);
        return true; // エラー時も安全策としてONを返す
    }
}
(async () => {
    if (await shouldRun()) {
        main();
    } else {
        console.log(`機能(${FEATURE_KEY})は無効になっています。`);
    }
})();
/********************************************************************************/

// css 読み込み
import "./content.css";

// mutationObserver ユーティリティ読み込み
import { observeElementAppearance } from "../../util/mutationObserver.js";

// ログアウト時にユーザー情報を削除する関数読み込み
import { addEventListenerToLogoutButtonAndClearUserInfo } from "./logout.js";

function main(){
    // ログインフォームが出現したら自動ログインを試みる
    observeElementAppearance("form.login-form", async (loginForm)=>{
        await automaticLogin();
    });

    // ログインボタンにユーザー情報保存のイベントリスナーを追加
    addEventListenerToLoginButtonAndSaveUserInfo();

    // ログアウトボタンにユーザー情報削除のイベントリスナーを追加
    addEventListenerToLogoutButtonAndClearUserInfo();
}

/* ログインボタンを押した際、ユーザー情報を取得し保存する関数 */
function addEventListenerToLoginButtonAndSaveUserInfo(){
    observeElementAppearance("form.login-form div.login-form-submit button.btn", (loginButton)=>{
        loginButton.addEventListener("click", (e)=>{
            const userName = document.querySelector("form.login-form input#username").value;
            const userPass = document.querySelector("form.login-form input#password").value;
            const encryptedPass = btoa(userPass);
            if(userName != "" && userPass != ""){
                const userInfo = {
                    username: userName,
                    password: encryptedPass
                };
                chrome.storage.sync.set({ automaticLoginUserInfo: userInfo }, () => {
                    console.log("ユーザー情報が保存されました。");
                });
            }
        });
    })
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

/* 自動ログイン関数 */
async function automaticLogin(){
    if(await isUserInfoStored()){
        const result = await chrome.storage.sync.get(["automaticLoginUserInfo"]);
        const userInfo = result.automaticLoginUserInfo;
        const decryptedPass = atob(userInfo.password);
        const usernameInput = document.querySelector("form.login-form input#username");
        const passwordInput = document.querySelector("form.login-form input#password");
        if(usernameInput && passwordInput){
            usernameInput.value = userInfo.username;
            passwordInput.value = decryptedPass;
            const loginButton = document.querySelector("form.login-form div.login-form-submit button.btn");
            if(loginButton){
                // 自動ログインの場合はユーザー情報を保存しない
                loginButton.removeEventListener("click", addEventListenerToLoginButtonAndSaveUserInfo);
                loginButton.click();
            }
        }
    }
}
