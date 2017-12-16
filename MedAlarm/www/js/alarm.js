
var switcher = false;
var temp_alarm_array = [];
//var accumIntervals = calcAllInterv();
//alert("Here");
//alert(accumIntervals);

//if(accumIntervals>0){
//    switcher = true;
//}


setInterval(function() {
    var date = new Date();
    var cuttime = getCurDate(date);
    
    $('#clock-wrapper').html(cuttime);
    
    checkAlarm(cuttime);

}, 500);

$(".btntosetalrm").click(function(){ //fix this next!
    setMultipleAlarm(new Date());
    alert("CLICKED!");
    //window.location = "home.html";
});

function setMultipleAlarm(date) {
    //var alarmArray = [];
    //alarmArray =  getPrescIdArray();

    temp_alarm_array.forEach(function(item, index, array) {
        setAlarm(date, item, 's');
    });
}

function checkAlarmList(date,cuttime) {
    var alarmArray = [];
    var alarmrow = [];
    alarmArray =  getPrescIdArray();
    alarmArray.forEach(function(item, index, array) {
        alarmrow = getPrescAlarmArray(item);

        if((alarmrow[0] == cuttime) && (alarmrow[3]>=0)){
            //$(".audioDemo").trigger('play');
            document.getElementById('audioDemo').play();
            //playAudio();
            setAlarm(date, item);
            alert("Drink your medicine now!");
        }    
    });
}

function addNew(num) {
    var med = document.getElementById('med_id' + num).value;
    var days = document.getElementById('times_id' + num).value;
    var dur_times_t;
    var dur_h_t = document.getElementById('hr_id' + num).value * 1;
    var dur_m_t = document.getElementById('min_id' + num).value * 1;

    var addedhr = parseInt(dur_m_t / 60);
    if(addedhr>0) {
        var finalmin = dur_m_t - (addedhr * 60);

        dur_h_t = (dur_h_t + addedhr)*1;
        dur_m_t = finalmin;
    }
    var temp_min;
    if(dur_m_t>0) {
        temp_min = dur_m_t/60;
    }
    else{
        temp_min = 0;
    }

    dur_times_t = setAlarmInterval(days, (dur_h_t + temp_min));
    var date = new Date();

    temp_alarm_array.push([getCurDate(date), med, dur_h_t, dur_m_t, dur_times_t]);
    //addAlarmToDB(getCurDate(date), med, dur_h_t, dur_m_t, dur_times_t);

    var stringInput = "<p>"+ med +": " + dur_h_t + " hour/s, " + dur_m_t + " min/s, " + dur_times_t + " times. <br></p>";
    var newLine = stringInput +" <div id=\"alarm_list_id"+(num+1)+"\">";
    newLine = newLine + "<input id=\"med_id"+(num+1)+"\" type=\"text\" placeholder=\"Enter medicine here\" class=\"addeventx\">";
    newLine = newLine + "<input id=\"hr_id"+(num+1)+"\" type=\"text\" placeholder=\"Hours\" class=\"addeventx\" >";
    newLine = newLine + "<input id=\"min_id"+(num+1)+"\" type=\"text\" placeholder=\"Minutes\" class=\"addeventx\" >";
    newLine = newLine + "<input id=\"times_id"+(num+1)+"\" type=\"text\" placeholder=\"How many days you want to set a reminder for this medicine?\" class=\"addeventx\" >"
    newLine = newLine + "<br><input type=\"button\" class=\"bttn\" value=\"+\" onclick=\"addNew("+(num+1)+")\"/><br><br><br>";
    console.log(newLine);
    document.getElementById('alarm_list_id' + num).innerHTML = newLine;
}

function setAlarm(date, current_row, setMode) {
    alert("setAlarm");
    var array_row = [];
    array_row = current_row;
    temp_med = array_row[1];
    dur_h = array_row[2];
    dur_m = array_row[3];
    dur_times = array_row[4];

    var alrmhr = date.getHours() + (dur_h*1);
    if(setMode=='sn') {
        var alrmmin = date.getMinutes() + 5;
    }
    else {
        var alrmmin = date.getMinutes() + (dur_m*1);
    }
    

    while(alrmmin>=60) {
        alrmmin = alrmmin - 60;
        alrmhr = alrmhr + 1;
    }

    var time_format;

    while(alrmhr>=24) {
        alrmhr = alrmhr - 24;
    }

    if(alrmhr>12) {
        time_format="pm";
        alrmhr = alrmhr - 12;
    }
    else {
        time_format="am";
    }
    alRmTime = alrmhr + ":" + ("0" + alrmmin).slice(-2) + " " + time_format;

    current_row[0] = alRmTime;

    //addAlarmToDB(alRmTime, temp_med, dur_h, dur_m, dur_times);
    //updateNextAlarm(p_id, alRmTime);
    if(setMode=='s') {
        finalizeAlarm(current_row);
    }
    
}

function finalizeAlarm(current_row) {
    addAlarmToDB(current_row[0], current_row[1], current_row[2], current_row[3], current_row[4]);
}

function getCurDate(date) {
    var min = ("0" + date.getMinutes()).slice(-2);
    var hour = date.getHours() * 1;
    var time_format;
    if(hour>12) {
        time_format="pm";
        hour = hour - 12;
    }
    else {
        time_format="am";
    }
    return  hour + ":" + min + " " + time_format;
}

function updateAlarmList() {
    var alarmLine = "<p>";
    alarmArray.forEach(function(item, index, array) {
        alarmLine = alarmLine + item[0] + ", " + (item[3]+1) + " times.<br>";
    });
    alarmLine = alarmLine + "</p>";
    document.getElementById('final_list').innerHTML = alarmLine;
}

function setAlarmInterval(days, duration) {
    var hrs = days*24;
    var intervalCtr = 0;
    while(hrs>=duration){
        if(hrs>=duration){
            hrs = hrs-duration;
            intervalCtr = intervalCtr + 1;
        }
    }

    return intervalCtr;
}

function playAudio() {
    var audioElement = document.getElementById('audioDemo').play();
    var url = audioElement.getAttribute('src');
    var my_media = new Media (url,
        function() {
            console.log("Success");
        },
        function(err) {
            console.log("Error: " + error);
        });

    my_media.play();
}

