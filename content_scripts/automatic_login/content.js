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

function main(){
    addCheckboxAutomaticLogin();
}

//親要素を取得
const formParentContent = document.querySelector("form.login-form");

/** ログイン画面にチェックボックスを挿入するための関数
 * @returns {void}
 */
function addCheckboxAutomaticLogin (){
    const automaticLoginCheckboxDiv = document.createElement("div");
    automaticLoginCheckboxDiv.setAttribute("id", "automatic-login-div-ext")
    const automaticLoginCheckboxLabel = document.createElement("label");
    // ログイン情報を記録するかどうかのinput
    const recordLoginInfoInput = document.createElement("input");
    recordLoginInfoInput.setAttribute("type", "checkbox");
    recordLoginInfoInput.setAttribute("id", "automatic-login-input-ext");
    const recordLoginInfoDescription = document.createElement("span");
    recordLoginInfoDescription.textContent = "ログイン情報を保存し自動でログインする。"
    automaticLoginCheckboxLabel.appendChild(recordLoginInfoInput);
    automaticLoginCheckboxLabel.appendChild(recordLoginInfoDescription);
    automaticLoginCheckboxDiv.appendChild(automaticLoginCheckboxLabel);
    formParentContent.querySelector("div.login-form-submit").prepend(automaticLoginCheckboxDiv);
}

/** ログインボタンにユーザー情報を記録するイベントを追加。 */
function addAddEventListenerToLoginButton(){
    const loginButton = document.querySelector("#loginbtn");
    loginButton.addEventListener("click", (e)=>{
        const userName = formParentContent.querySelector("input#username").value;
        const userPass = formParentContent.querySelector("input#password").value;
        if(userName != "" && userPass != ""){
            
        }

    });
}