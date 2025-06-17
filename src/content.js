window.addEventListener("load", main, false);

function main(e){
    //document.getElementById("instance-5-header").innerHTML = "コース概要ううううう～～～～↑"
    let div_TT = document.createElement("div");
    let time_table = document.createElement("table");

    //曜日作成
    let tr_day = document.createElement("tr");
    let tr_1 = document.createElement("tr");
    let tr_2 = document.createElement("tr");
    let tr_3 = document.createElement("tr");
    let tr_4 = document.createElement("tr");
    let tr_5 = document.createElement("tr");
    let tr_6 = document.createElement("tr");

    tr_day.innerHTML = "<th>時限</th><td>月曜</td><td>火曜</td><td>水曜</td><td>木曜</td><td>金曜</td>";
    tr_2.innerHTML = '<th>1限<br><span class="class_time">08:50~10:20</span></th>';
    tr_1.innerHTML = '<th>2限<br><span class="class_time">10:30~12:00</span></th>';
    tr_3.innerHTML = '<th>3限<br><span class="class_time">13:00~14:30</span></th>';
    tr_4.innerHTML = '<th>4限<br><span class="class_time">14:40~16:10</span></th>';
    tr_5.innerHTML = '<th>5限<br><span class="class_time">16:20~17:50</span></th>';
    tr_6.innerHTML = '<th>6限<br><span class="class_time">18:00~19:30</span></th>';

    

    //最後の仕上げ　いろいろ挿入

    time_table.appendChild(tr_day);
    time_table.appendChild(tr_1);
    time_table.appendChild(tr_2);
    time_table.appendChild(tr_3);
    time_table.appendChild(tr_4);
    time_table.appendChild(tr_5);
    time_table.appendChild(tr_6);
    
    div_TT.appendChild(time_table)
    document.getElementById("instance-5-header").appendChild(div_TT);
    //document.querySelector('[id^="block-myoverview-"]').insertBefore(div_TT, document.getElementById(""))
    console.log("...success");
    

}