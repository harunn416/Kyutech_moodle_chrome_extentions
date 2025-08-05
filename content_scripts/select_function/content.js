main();
function main(){
    // ページ読み込み時に拡張機能のコンフィグ画面を設定。
    createListOparateButton(); //オプション出現ボタン
}

/** 上のリストの中に拡張機能設定用のボタンを作成 */
function createListOparateButton() {
    //親要素
    const parentElement = document.querySelector("nav.navbar div.primary-navigation ul[role='menubar']");
    console.log(parentElement);

    //リスト
    const listOparateButton = document.createElement("li");
    listOparateButton.setAttribute("class", "nav-item");
    listOparateButton.setAttribute("data-forceintomoremenu", "false");
    listOparateButton.addEventListener("click", (e) => { console.log("性交成功"); }); //クリック時にコンフィグ要素を出現

    // リストの中のaタグ
    const aListOparateButton = document.createElement("a");
    aListOparateButton.style.textAlign = "center";
    aListOparateButton.setAttribute("class", "nav-link");
    aListOparateButton.setAttribute("role", "menuitem");
    aListOparateButton.setAttribute("href", "#");
    aListOparateButton.setAttribute("tabindex", "-1");
    aListOparateButton.innerHTML = "Moodle KIT<br>拡張機能設定";

    //それぞれの要素を追加
    listOparateButton.appendChild(aListOparateButton);
    parentElement.appendChild(listOparateButton);
}