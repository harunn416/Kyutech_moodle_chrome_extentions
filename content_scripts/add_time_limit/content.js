// https://ict-i.el.kyutech.ac.jp/my/ で反応するようにする。
// つまり、「ダッシュボード」ページで反応してもらう。

import "./content.css";

// 提出物一覧が入っているdev要素を繰り返し検索
let intarvalSearchSubmittion = setInterval(searchSubmittionElement, 1000);

/** 提出物一覧が入っているdev要素を検索する関数
 * @returns {void}
 */
function searchSubmittionElement() {
    let SubmitsDivElement = document.querySelector("div.pb-2[data-region='event-list-wrapper']");
    if (SubmitsDivElement) {
        //console.log("要素が見つかりました。");
        addTimeLimit(SubmitsDivElement);
    } else {
        //console.log("要素が見つかりません。");
    }
}

/**
 * 制限時間を追加する関数
 * @param {HTMLDivElement} SubmitsDivElement 提出物が直下に格納されてるdiv要素
 * @returns {void}
*/
function addTimeLimit(SubmitsDivElement) {
    // div内の日付と時間が格納されているdiv要素を取得
    let divChildren = Array.from(SubmitsDivElement.children);
    let timeLimitDate = ""; // 処理内で新しい日付を追加する。
    divChildren.forEach(divElement => {
        if (divElement.getAttribute("data-region") == "event-list-content-date") { // 日付要素
            // 日付文字列を取得しdate要素に変換
            let dayString = divElement.querySelector("h5").innerHTML;
            timeLimitDate = parseJapaneseDateString(dayString);
        } else { // 提出物要素
            Array.from(divElement.children).forEach(divSubmission => {
                const submitDiv = divSubmission.querySelector("div.timeline-name");
                const timeLimit = submitDiv.querySelector("small").innerHTML;
                const timeMatch = timeLimit.match(/(\d{2}):(\d{2})/);
                if (timeMatch) { // 提出時間が取得できたかどうか。
                    const hours = parseInt(timeMatch[1], 10);
                    const minutes = parseInt(timeMatch[2], 10);
                    // 既存の Date オブジェクトに時間を設定
                    timeLimitDate.setHours(hours);
                    timeLimitDate.setMinutes(minutes);

                    // 残り時間のdiv要素作成
                    const timeLimitDiv = document.createElement("div");
                    timeLimitDiv.setAttribute("class", "timeLimitDivCustomise");

                    // 現在時刻との差を出す。
                    let timeDefference = findDifferenceBetweenTwoTimes(timeLimitDate, new Date());

                    // 残り
                    const timeLimitNokoriDiv = document.createElement("div");
                    if (timeDefference.positiveNegative == -1) { // 期限過ぎてるときは文字を赤色に
                        timeLimitDiv.style.color = "#570000ff";
                        timeLimitNokoriDiv.innerHTML = "超過"; // 「残り」ではなく「超過」に
                    } else {
                        timeLimitNokoriDiv.innerHTML = "残り";
                        if (timeDefference.days >= 1) { // 1日以上余裕あり
                            timeLimitDiv.style.color = "#269900";
                        } else if (timeDefference.hours >= 6) { // 24 ~ 6時間
                            timeLimitDiv.style.color = "#998f00";
                        } else { // 6時間位内 危険！
                            timeLimitDiv.style.color = "#990a00";
                        }
                    }

                    timeLimitDiv.appendChild(timeLimitNokoriDiv);

                    // 残り時間要素の作成
                    if (timeDefference.months !== 0) { // 月要素
                        const monthDiv = document.createElement("div");
                        monthDiv.style.fontSize = "13px";
                        monthDiv.setAttribute("class", "timeLimit_extention");
                        monthDiv.innerHTML = timeDefference.months + "ヶ月";
                        timeLimitDiv.appendChild(monthDiv);
                    }
                    if (timeDefference.days !== 0 || timeDefference.hours !== 0) {
                        const daysAndHoursDiv = document.createElement("div");
                        daysAndHoursDiv.style.fontSize = "13px";
                        daysAndHoursDiv.setAttribute("class", "timeLimit_extention");
                        if (timeDefference.days !== 0) { daysAndHoursDiv.innerHTML += timeDefference.days + "日 "; }
                        if (timeDefference.hours !== 0) { daysAndHoursDiv.innerHTML += timeDefference.hours + "時間"; }
                        timeLimitDiv.appendChild(daysAndHoursDiv);
                    }
                    const minutesAndSecondsDiv = document.createElement("div");
                    minutesAndSecondsDiv.style.fontSize = "13px";
                    minutesAndSecondsDiv.setAttribute("class", "timeLimit_extention");
                    minutesAndSecondsDiv.innerHTML = timeDefference.minutes + "分 " + timeDefference.seconds + "秒";
                    timeLimitDiv.appendChild(minutesAndSecondsDiv);

                    // 残り時間追加
                    const insertLimittimeDiv = divSubmission.querySelector("div.d-flex.timeline-name");
                    if (insertLimittimeDiv.querySelector("div.timeLimitDivCustomise")) { // 既存の残り時間は消して更新
                        insertLimittimeDiv.querySelector("div.timeLimitDivCustomise").remove();
                    }
                    insertLimittimeDiv.insertBefore(timeLimitDiv, insertLimittimeDiv.querySelector("small").nextElementSibling);
                } else {
                    console.log("提出時間が見つかりませんでした。");
                }
            });
        }
    });
}

function parseJapaneseDateString(dateString) {
    // 正規表現を使って、年、月、日を抽出
    // 例: "2025年 07月 20日(日曜日)" から "2025", "07", "20" を抽出
    const match = dateString.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/);
    //console.log(match);

    if (match) {
        // match[0] は全体のマッチ、match[1]は年、match[2]は月、match[3]は日
        const year = parseInt(match[1], 10);
        // 月は0から始まるインデックスなので、1を引く
        const month = parseInt(match[2], 10) - 1;
        const day = parseInt(match[3], 10);

        // Dateオブジェクトを作成 (時間はデフォルトで00:00:00)
        // 日本のタイムゾーンでDateオブジェクトを作成したい場合は、
        // Date.UTC() を使ってUTC時刻として作成し、後で調整するか、
        // ライブラリを使うのが一般的ですが、単純な日付オブジェクトならこれで十分です。
        const dateObject = new Date(year, month, day);

        return dateObject;
    } else {
        console.error("日付文字列の形式が認識できません: " + dateString);
        return null;
    }
}

/** 2つの時刻の差を求める関数
 * timeA - timeB
 * @param {dateObject} timeA
 * @param {dateObject} timeB
 * @returns {json} defferenceInformation
 */
function findDifferenceBetweenTwoTimes(timeA, timeB) {
    let timeDifference = timeA.getTime() - timeB.getTime();
    let positiveNegative = 1;
    if (timeDifference < 0) {
        positiveNegative = -1;
        //時間差を正に
        timeDifference = timeDifference * (-1);
    }

    const oneSecond = 1000; // ミリ秒
    const oneMinute = oneSecond * 60;
    const oneHour = oneMinute * 60;
    const oneDay = oneHour * 24;
    const oneMonth = oneDay * 30;

    let remainingMs = timeDifference;

    const months = Math.floor(remainingMs / oneMonth);
    remainingMs %= oneMonth; // 月数を引いた残りのミリ秒

    const days = Math.floor(remainingMs / oneDay);
    remainingMs %= oneDay; // 日数を引いた残りのミリ秒

    const hours = Math.floor(remainingMs / oneHour);
    remainingMs %= oneHour; // 時間を引いた残りのミリ秒

    const minutes = Math.floor(remainingMs / oneMinute);
    remainingMs %= oneMinute; // 分を引いた残りのミリ秒

    const seconds = Math.floor(remainingMs / oneSecond);
    return {
        positiveNegative: positiveNegative,
        months: months,
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds
    }
    //console.log(`目標時刻まで残り: ${days}日 ${hours}時間 ${minutes}分 ${seconds}秒`);
}