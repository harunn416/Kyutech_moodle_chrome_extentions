//親要素を取得
const formParentContent = document.querySelector("form.login-form");

/** ログイン画面に(チェックボックスや)保存ボタンを挿入するための関数
 * @returns {void}
 */
function addCheckboxAutomaticLogin (){

    //もろもろが入るdiv要素
    const operationDiv = document.createElement("div");
    operationDiv.setAttribute("id", "automatic-login-ext");

    const saveButtonAutomaticLogin = document.createElement("button");
}

console.log(formParentContent.querySelector("input#username").value);
console.log(formParentContent.querySelector("input#password").value);