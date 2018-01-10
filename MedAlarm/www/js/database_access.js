document.addEventListener("deviceready", onDeviceReady, false);
var db = null;
var doNotify = true;
function onDeviceReady() {
    db = window.sqlitePlugin.openDatabase({name: "med_alarm_db.db", location: 'default', createFromLocation: 1});
    db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS event(event_id integer PRIMARY KEY AUTOINCREMENT, event_name varchar(30), event_desc text, start_date date, is_running boolean)',[],nullHandler,errorHandler);
    },
    function(error) {
        console.log("Database is not ready, error: " + error);
    },
    function() {
        console.log("Database is ready");
    });
    db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS Medicine(Med_id integer PRIMARY KEY AUTOINCREMENT, GenericName TEXT, Type TEXT, BrandName TEXT, Indications TEXT, SideEffects TEXT, Dosage TEXT)',[],nullHandler,errorHandler);
    },
    function(error) {
        console.log("Database is not ready, error: " + error);
    },
    function() {
        console.log("Database is ready");
    });

    db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS user(fname varchar(15), mname varchar(15), lname varchar(15), age integer, email_ad varchar(25), gender varchar(6), key_id integer PRIMARY KEY)',[],nullHandler,errorHandler);
    },
    function(error) {
        console.log("Database is not ready, error: " + error);
    },
    function() {
        console.log("Database is ready");
    });

    db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS prescription(presc_id integer PRIMARY KEY AUTOINCREMENT, pmed_id text, next_alarm varchar(8), hrs_dur integer, mins_dur integer, interval_times integer, e_id integer REFERENCES event(event_id), next_alarm_date date, is_one_day_alarm boolean)',[],nullHandler,errorHandler);
    },
    function(error) {
        console.log("Database is not ready, error: " + error);
    },
    function() {
        console.log("Database is ready");
    });

    db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS logs (log_id INTEGER PRIMARY KEY autoincrement, e_id INTEGER REFERENCES event(event_id), start_date date, finish_date date, generated_text TEXT)',[],nullHandler,errorHandler);
    },
    function(error) {
        console.log("Database is not ready, error: " + error);
    },
    function() {
        console.log("Database is ready");
    });

    var urlPath = window.location.pathname;
    if(urlPath=="/android_asset/www/home.html") {
        loadUser();
        showEventList();
        //checkEvent();
        //showAlarmList();

    }

    if(urlPath=="/android_asset/www/searchresult.html") {
        var urlWithParams = window.location.href;
        var sv = getParameterByName('s', urlWithParams);
        
        searchResults(sv);
    }


    if(urlPath=="/android_asset/www/list.html") {
        showPList();
    }



    cordova.plugins.autoStart.enable();
    cordova.plugins.backgroundMode.enable();
}


function checkEvent(){
     db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM event";
        console.log("checkEvent");
        transaction.executeSql(executeQuery, [], function(tx, result) {
            console.log(result.rows.length);
        },
        function(error) {
            console.log('Error:' + error);
        });
    },
    function(error) {
        console.log('Error transaction: ' + error);
    },
    function() {
        console.log('Success transaction');
    });
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addEvent() { //check and debug this!
    console.log("Addevent is clicked!");
    var new_event_name = "";
    var new_event_desc = "";
    var randomNum = getRandomInt(0,10000);
    db.transaction(function(transaction) {
        new_event_name = document.getElementById('addillnessinput').value;
        new_event_desc = document.getElementById('addillnessarea').value;
        var executeQuery = "INSERT INTO event (event_id, event_name, event_desc, start_date, is_running) VALUES (?, ?,?, date('now'), 1)";
        transaction.executeSql(executeQuery, [randomNum, new_event_name, new_event_desc],nullHandler,errorHandler);

    },
    function (error) {
        console.log('Error' + error);
    },
    function() {
        console.log('Success event: ' );
        //window.location = "alarm3.html";

        newLogEntry(randomNum, new_event_name, new_event_desc);
    });
    
}

function getLastId() {
    var temp_id=0;

    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM event";
        transaction.executeSql(executeQuery, [], function(tx, result) {
            temp_id = result.rows.length;
            console.log("temp_id: " + temp_id);
        },
        function(error) {
            console.log('Error (getLastId):' + error);
        });
    },
    function(error) {
        console.log('Error transaction (getLastId): ' + error);
    },
    function() {
        console.log('Success getLastId');
        
    });
    return temp_id;
}


function createUser() { 

    //console.log("Wow");
    db.transaction(function(transaction) {
        var fname = document.getElementById('fname').value;
        var mname = document.getElementById('mname').value;
        var lname = document.getElementById('lname').value;
        var email_ad = document.getElementById('email').value;
        var gender = document.getElementById('gender').value;
        var age = document.getElementById('age').value;
        var executeQuery = "INSERT INTO user (fname, mname, lname, age, email_ad, gender, key_id) VALUES (?,?,?,?,?,?,?)";
        transaction.executeSql(executeQuery, [fname, mname, lname, age, email_ad, gender, 10001],nullHandler,errorHandler);
    },
    function (error) {
        console.log('Error' + error);
    },
    function() {
        console.log('Success insert');
    });

    confirmUser();
}   

function confirmUser() {

    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM user";
        transaction.executeSql(executeQuery, [], function(tx, result) {
            console.log("Added new user: " + result.rows.item(0).lname + ", " + result.rows.item(0).fname + " (" + result.rows.item(0).email_ad + ").");
        },
        function(error) {
            console.log('Error:' + error);
        });
    },
    function(error) {
        console.log('Error transaction: ' + error);
    },
    function() {
        console.log('Success transaction');
        window.location = "home.html";
    });

}

function checkForNewUser() {
    console.log("Checking for registered user...");
    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM user";
        transaction.executeSql(executeQuery, [], function(tx, result) {
            var userNumber = result.rows.length;
            if(userNumber==0) {
                console.log("No user found. Please register.");
                window.location="index2.html";
            }
            else {
                console.log("A user is found. Loading user with name " + result.rows.item(0).lname);
                window.location="home.html";
            }
        },
        function(error) {
            console.log('Error:' + error);
        });
    },
    function(error) {
        console.log('Error transaction: ' + error);
    },
    function() {
        console.log('Success transaction');
    });
}

function loadUser() {
    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM user";
        transaction.executeSql(executeQuery, [], function(tx, result) {
            var userNumber = result.rows.length;
            document.getElementById('par_id').innerHTML = "" + result.rows.item(0).lname + ", " + result.rows.item(0).fname + " " + result.rows.item(0).mname;
        },
        function(error) {
            console.log('Error:' + error);
        });
    },
    function(error) {
        console.log('Error transaction: ' + error);
    },
    function() {
        console.log('Success transaction');
    });

}


function addAlarmToDB(nextAlarm, meds, hrs, mins, times) { 
    console.log("Accessed! " + nextAlarm + ", " + meds + ", " + hrs + ", " + mins + ", " + times);
    console.log(getLastId());
  
    var urlWithParams = window.location.href;
    var eid = getParameterByName('a', urlWithParams);

    db.transaction(function(transaction) {
        console.log('Here daw!');
        var executeQuery;
        if(hrs==24){
            executeQuery = "INSERT INTO prescription (pmed_id, next_alarm, hrs_dur, mins_dur, interval_times, e_id, next_alarm_date, is_one_day_alarm) VALUES (?,?,?,?,?,?, date('now', '+1 day'), 1)"
        }
        else{
            executeQuery = "INSERT INTO prescription (pmed_id, next_alarm, hrs_dur, mins_dur, interval_times, e_id, is_one_day_alarm) VALUES (?,?,?,?,?,?, 0)"
        }
        transaction.executeSql(executeQuery, [meds, nextAlarm, hrs, mins, times, eid],nullHandler,errorHandler);
    },
    function (error) {
        console.log('Error' + error);
    },
    function() {
        console.log('Success addAlarmToDB');
        updateLogText(recentNewEventId, meds);
    });

}

function getPrescIdArray() {
    var id_array=[];
    var return_array = [];
    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM prescription";
        transaction.executeSql(executeQuery, [], function(tx, result) {
            var presc_len = result.rows.length;
            //console.log("presc_len: " + presc_len);
            for(i=0; i<presc_len; i++) {
                console.log("presc_id.pushing - " + result.rows.item(i).presc_id);
                id_array.push(result.rows.item(i).presc_id);
            }
            
        },
        function(error) {
            console.log('Error:' + error);
        });
    },
    function(error) {
        console.log('Error getPrescIdArray: ' + error);
    },
    function() {
        console.log('Success getPrescIdArray');
        id_array.forEach(function(item, index, array) {
            return_array.push(item);
        });
        
    });

    console.log("return_array[1]: " + return_array[1]);
    return return_array;
}

function getPrescAlarmArray(alarm_index) {
    var alarm_array=[];
    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM prescription WHERE presc_id="+alarm_index;
        transaction.executeSql(executeQuery, [], function(tx, result) {
            alarm_array.push(result.rows.item(0).next_alarm);
            alarm_array.push(result.rows.item(0).hrs_dur);
            alarm_array.push(result.rows.item(0).mins_dur);
            alarm_array.push(result.rows.item(0).interval_times);
        },
        function(error) {
            console.log('Error:' + error);
        });
    },
    function(error) {
        console.log('Error getPrescAlarmArray: ' + error);
    },
    function() {
        console.log('Success getPrescAlarmArray');
    });
    return alarm_array;
}



function getAlarmLastId() {
    var temp_id;

    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM event";
        transaction.executeSql(executeQuery, [], function(tx, result) {
            console.log("LENGTH: "+ result.rows.length);
            temp_id = result.rows.length;
        },
        function(error) {
            console.log('Error (getLastId):' + error);
        });
    },
    function(error) {
        console.log('Error transaction (getAlarmLastId): ' + error);
    },
    function() {
        console.log('Success getAlarmLastId');
        
    });
    console.log("temp_a_id: " + temp_id);
    return temp_id;
}

function calcAllInterv() {
    var sum=0;

    db.transaction(function(transaction) {

        var executeQuery = "SELECT * FROM prescription";
        transaction.executeSql(executeQuery, [], function(tx, result) {
            var p_number = result.rows.length;
            for(i=0; i<p_number;i++){
                sum = sum + result.rows.item(i).interval_times;
            }

        },
        function(error) {
            console.log('Error:' + error);
        });
    },
    function(error) {
        console.log('Error transaction: ' + error);
    },
    function() {
        console.log('Success transaction');
    });

    return sum;
}


function showAlarmList() {
    var alarmLength = 0;
    var newLine = "<p>";
    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM prescription";
        transaction.executeSql(executeQuery, [], function(tx, result) {
            alarmLength = result.rows.length;
            for (i=0; i<alarmLength; i++) {
                newLine = newLine + result.rows.item(i).pmed_id + ": " + result.rows.item(i).next_alarm + ", " + result.rows.item(i).interval_times + " more times., One day?: " + result.rows.item(i).is_one_day_alarm + "<br>";
            }
        },
        function(error) {
            console.log('Error:' + error);
        });
    },
    function(error) {
        console.log('Error showAlarmList: ' + error);
    },
    function() {
        console.log('Success showAlarmList');
        console.log('alarmLength: ' + alarmLength);
        newLine = newLine + "</p>";
        if(alarmLength>0) {
            document.getElementById('current_alarms').innerHTML = newLine;
        }

        else {
            document.getElementById('current_alarms').innerHTML = "<p>No alarms!</p>";
        }
    });

}

//fix this one.
function currentDate(){
    date = new Date();

    var year = ("0" + date.getFullYear()).slice(-2);
    var mm = (("0" + date.getMonth()).slice(-2) * 1) + 1;
    var day = ("0" + getDate(0)).slice(-2);

    return "" + year + "-" + mm + "-" + day;
}

function checkEvent(cuttime) {
    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM event WHERE is_running=1";
        console.log(executeQuery);
        transaction.executeSql(executeQuery, [], function(tx, result) {
            var len = result.rows.length;

            for(i=0; i<len; i++) {
                checkAlarm(cuttime, result.rows.item(i).event_id)
            }
        },
        function(error) {
            console.log('Error:' + error);
        });
    },
    function(error) {
        console.log('Error checkEvent(cuttime): ' + error);
    },
    function() {
        console.log('Success checkEvent(cuttime)');
    });

}


function checkAlarm(cuttime) {
    var row_id;
    var med_n = "";
    var willUpdate=false, willSnooze=false;
    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM prescription";
        
        transaction.executeSql(executeQuery, [], function(tx, result) {
            
            var presc_len = result.rows.length;
            var med_alert;
            if(doNotify) {
            for(i=0; i<presc_len; i++) {
                med_n = result.rows.item(i).pmed_id;
                 if((result.rows.item(i).next_alarm == cuttime) && (result.rows.item(i).interval_times>0)) {
                    doNotify=false;
                    if(result.rows.item(i).is_one_day_alarm==1) {
                        if(result.rows.item(i).next_alarm_date==currentDate()){
                            
                            cordova.plugins.notification.local.schedule({
                                id: 123,
                                title: 'Drink your medicine',
                                text: 'Drink '+ med_n,
                                foreground: true
                            });
                        }
                    }
                    else{
                        
                        cordova.plugins.notification.local.schedule({
                            id: 123,
                            title: 'Drink your medicine',
                            text: 'Drink '+ med_n,
                            foreground: true
                        });
                    }
                    
                    
                    row_id = result.rows.item(i).presc_id;
                    cordova.plugins.notification.local.on("click", function (notification, state) {
                        navigator.notification.confirm(
                            'Drink' + med_n,
                             function(buttonIndex) {
                                if(buttonIndex==1) {
                                    //willUpdate=true;
                                    updateNextAlarm(row_id, 'u');
                                }
                                else {
                                    //willSnooze=true;
                                    updateNextAlarm(row_id, 'sn');
                                }
                                doNotify=true;
                             },            
                            'Drink your medicine',
                            ['Drink','Snooze']     
                        );
                        
                    }, this);
                    //alert("Drink your " + med_n); //12345678
                    navigator.notification.confirm(
                        'Drink' + med_n,
                         function(buttonIndex) {
                            cordova.plugins.notification.local.clearAll(function() {
                                //alert("done");
                            }, this);
                            if(buttonIndex==1) {
                                //willUpdate=true;
                                updateNextAlarm(row_id, 'u');
                            }
                            else {
                                //willSnooze=true;
                                updateNextAlarm(row_id, 'sn');
                            }
                            doNotify=true;
                         },            
                        'Drink your medicine',
                        ['Drink','Snooze']     
                    );
                    
                 }
            }}
            
        },
        function(error) {
            console.log('Error:' + error);
        });
    },
    function(error) {
        console.log('Error checkAlarm: ' + error);
    },
    function() {
        console.log('Success checkAlarm');
        //if(willUpdate) {
        //    updateNextAlarm(row_id, 'u');
        //}

        //else if(willSnooze) {
        //     updateNextAlarm(row_id, 'sn');
        //}        
                
    });

}
function getMedicineName(m_id) {
    var med_name = "";
    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM Medicine WHERE Med_id="+m_id;
        //console.log(executeQuery);
        transaction.executeSql(executeQuery, [], function(tx, result) {
            med_name = result.rows.item(0).GenericName;
            console.log(med_name);
        },
        function(error) {
            console.log('Error:' + error);
        });
    },
    function(error) {
        console.log('Error getMedicineName: ' + error);
    },
    function() {
        console.log('Success getMedicineName');
    });

    return med_name;
}

function deleteAlarmByEvId(eid) {
    console.log("delete event clicked!");
    db.transaction(function(transaction) {
        var executeQuery = "DELETE FROM prescription WHERE e_id=?";
        transaction.executeSql(executeQuery, [eid],nullHandler,errorHandler);
    },
    function (error) {
        console.log('Error' + error);
    },
    function() {
        console.log('Success deleteAlarmByEvId');
    });
}


function deleteEvent(ev_id) {
    console.log("delete event clicked!");
    db.transaction(function(transaction) {
        deleteAlarmByEvId(ev_id);
        var executeQuery = "UPDATE event SET is_running=0 WHERE event_id=?";
        transaction.executeSql(executeQuery, [ev_id],nullHandler,errorHandler);
    },
    function (error) {
        console.log('Error' + error);
    },
    function() {
        console.log('Success deleteEvent');
        showEventList();
    });
}

function deleteAlarm(a_id) {
    console.log("delete event clicked!");
    db.transaction(function(transaction) {
        var executeQuery = "DELETE FROM prescription WHERE presc_id=?";
        transaction.executeSql(executeQuery, [a_id],nullHandler,errorHandler);
    },
    function (error) {
        console.log('Error' + error);
    },
    function() {
        console.log('Success deleteAlarm');
        showPList();
    });
}




function snooze(alarm_index,new_next_alarm) {
    db.transaction(function(transaction) {
        var executeQuery = "UPDATE prescription SET next_alarm=? WHERE presc_id=?";
        transaction.executeSql(executeQuery, [new_next_alarm, alarm_index],nullHandler,errorHandler);
    },
    function (error) {
        console.log('Error' + error);
    },
    function() {
        console.log('Success snooze');
    });

}


function updateNextAlarm(alarm_index, setMode) {
    var temp_array = [];
    var is_one_day;
    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM prescription WHERE presc_id=" + alarm_index;
        
        transaction.executeSql(executeQuery, [], function(tx, result) {
            temp_array.push(result.rows.item(0).next_alarm);
            temp_array.push(result.rows.item(0).med_name);
            temp_array.push(result.rows.item(0).hrs_dur);
            temp_array.push(result.rows.item(0).mins_dur);
            temp_array.push(result.rows.item(0).interval_times);
            is_one_day = result.rows.item(0).is_one_day_alarm;
            
        },
        function(error) {
            console.log('Error:' + error);
        });
    },
    function(error) {
        console.log('Error checkAlarm: ' + error);
    },
    function() {
        console.log('Success updateNextAlarm');
        if(setMode=='u'){
            setAlarm(new Date(), temp_array, 'u');
            setNextAlarm(alarm_index, temp_array[0]);
            if(is_one_day==1) {
                setNextAlarmDate(alarm_index);
            }      
        }
        else {
            setAlarm(new Date(), temp_array, 'sn');
            snooze(alarm_index, temp_array[0]);
        }
          
    });

}

function setNextAlarmDate(alarm_index) {
    db.transaction(function(transaction) {
        var executeQuery = "UPDATE prescription SET next_alarm_date=date('now', '+day') WHERE presc_id=?";
        transaction.executeSql(executeQuery, [new_next_alarm, alarm_index],nullHandler,errorHandler);
    },
    function (error) {
        console.log('Error' + error);
    },
    function() {
        console.log('Success update next alarm date');
    });
}

function setNextAlarm(alarm_index, new_next_alarm) {//update for 24 hours alarms
    db.transaction(function(transaction) {
        var executeQuery = "UPDATE prescription SET next_alarm=?, interval_times=interval_times-1 WHERE presc_id=?";
        transaction.executeSql(executeQuery, [new_next_alarm, alarm_index],nullHandler,errorHandler);
    },
    function (error) {
        console.log('Error' + error);
    },
    function() {
        console.log('Success update setNextAlarm');
    });

}

function showMeds() {
    var med_option = "";
    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM Medicine";
        transaction.executeSql(executeQuery, [], function(tx, result) {
            var len = result.rows.length;

            for(i=0; i<len; i++) {
                med_option = med_option + "<option value=" + result.rows.item(i+1).GenericName + ">";
            }
        },
        function(error) {
            console.log('Error:' + error);
        });
    },
    function(error) {
        console.log('Error showMeds: ' + error);
    },
    function() {
        console.log('Success showMeds');
        document.getElementById('med_option_id') = med_option;
    });

}

function newLogEntry(ev_id, e_name, e_desc) { //check and debug this!
    console.log("newLogEntry is clicked!");
    var temp_gt = "Illness: " + e_name + ", ---- Description: " + e_desc;
    db.transaction(function(transaction) {
        var executeQuery = "INSERT INTO logs (e_id, generated_text ,start_date) VALUES (?,?,date('now'))";
        transaction.executeSql(executeQuery, [ev_id, temp_gt],nullHandler,errorHandler);

    },
    function (error) {
        console.log('Error' + error);
    },
    function() {
        console.log('Success log new event: ' );
        window.location = "alarm3.html?a=" + ev_id;
    });
}

function updateLogText(ev_id, added_text) {
    db.transaction(function(transaction) {
        var executeQuery = "UPDATE logs SET generated_text = generated_text || ? || "+"','"+" WHERE e_id=?";
        transaction.executeSql(executeQuery, [ev_id, added_text],nullHandler,errorHandler);
    },
    function (error) {
        console.log('Error' + error);
    },
    function() {
        console.log('Success updateLogText');
    });

}

function search() {//fix this one!
    var search_result = document.getElementById('search_id').value;
    if (search_result.trim() == '') {
        $("#error1").modal('show');
        //alert("ERROR. Search input is empty.");
    } else  {
        window.location = "searchresult.html?s=" + search_result;
    }
}

function searchResults(search_result) {
    var table_results = "<table  id=\"\" class=\" rwd1-table table-responsive \"><tr><th>Generic name</th><th>Type</th><th>Brand name</th><th>Indications</th><th>Side effects</th><th>Dosage</th></tr>";
    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM Medicine WHERE LOWER(GenericName) LIKE LOWER('%"+search_result+"%')";
        console.log(executeQuery);
        transaction.executeSql(executeQuery, [], function(tx, result) {
            var len = result.rows.length;
            for(i=0; i<len; i++) {
                table_results = table_results + "<tr>";
                table_results = table_results + "<td data-th=\"Generic name\">" + result.rows.item(i).GenericName + "</td>";
                table_results = table_results + "<td data-th=\"Type\">" + result.rows.item(i).Type + "</td>";
                table_results = table_results + "<td data-th=\"Brand name\">" + result.rows.item(i).BrandName + "</td>";
                table_results = table_results + "<td data-th=\"Indications\">" + result.rows.item(i).Indications + "</td>";
                table_results = table_results + "<td data-th=\"Side effects\">" + result.rows.item(i).SideEffects + "</td>";
                table_results = table_results + "<td data-th=\"Dosage\">" + result.rows.item(i).Dosage + "</td>";
                table_results = table_results + "</tr>";
            }
        },
        function(error) {
            console.log('Error:' + error);
        });
    },
    function(error) {
        console.log('Error searchResults: ' + error);
    },
    function() {
        table_results = table_results + "</table>";
        console.log('Success searchResults');
        //console.log(table_results);
        document.getElementById('search_table_result').innerHTML = table_results;
    });    
}

function miniSearch() {
    console.log("miniSearch is clicked!");
    var search_result = document.getElementById('addmedicine').value;
    if (search_result.trim() == '') {
        //something
    } else  {
        var option_result = "<select id=\"med_id\"  class=\" form-control select-primary mrs mbm\" style=\"display: none;\">";
        db.transaction(function(transaction) {
            var executeQuery = "SELECT * FROM Medicine WHERE LOWER(GenericName) LIKE LOWER('%"+search_result+"%') OR LOWER(BrandName) LIKE LOWER('%"+search_result+"%')";
            console.log(executeQuery);
            transaction.executeSql(executeQuery, [], function(tx, result) {
                var len = result.rows.length;
                for(i=0; i<len; i++) {
                    option_result = option_result + "<option value=\"" + result.rows.item(i).GenericName +"\">" + result.rows.item(i).BrandName + "</option>";
                }
            },
            function(error) {
                console.log('Error:' + error);
            });
        },
        function(error) {
            console.log('Error searchResults: ' + error);
            option_result = option_result + "</select>";
        },
        function() {
            console.log('Success miniSearch');
            option_result = option_result + "</select>";
            document.getElementById('med_select').innerHTML = option_result;
            //console.log(table_results);
        });
    }
      

}

function showEventList() {
    var modal_html = "";
    var event_line = "";
    console.log("showEventList pasok!");
    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM event WHERE is_running=1";
        transaction.executeSql(executeQuery, [], function(tx, result) {
            var len = result.rows.length;
            if(len>0) {
                document.getElementById("changeImage").innerHTML = "<img id=\"happyimg\" src=\"images/happy3.png\">";
                event_line = event_line + "<table class=\"table table-bordred \"><thead> <th>Illness</th><th></th><th></th></thead><tbody>";
                for(i=0; i<len; i++) {
                    console.log(result.rows.item(i).event_name);
                    event_line = event_line + "<tr><td> <a class=\"atags\" href=\"list.html?e="+result.rows.item(i).event_id+"\">" +result.rows.item(i).event_name+"</a></td>";
                    event_line = event_line + "<td><p data-placement=\"top\"  title=\"Delete\"><button class=\"btn btn-Primary btn-xs\" data-title=\"Delete\" data-toggle=\"modal\" data-target=\"#delete"+result.rows.item(i).event_id+"\" ><span class=\"glyphicon glyphicon-trash\"></span></button></p></td>";
                    event_line = event_line + "<td><p data-placement=\"top\"  title=\"Open\"><button class=\"btn btn-Info btn-xs\" onclick=\"'window.location.href=list.html?e="+result.rows.item(i).event_id+"'\" ><span class=\"glyphicon glyphicon-pencil\"></span></button></p></td>";
                    event_line = event_line + "</tr>";
                    
                    modal_html = modal_html + modalDiv(result.rows.item(i).event_id);
                }
                event_line = event_line + " </tbody></table>";
            }
            else {
                document.getElementById("changeImage").innerHTML = "<img id=\"happyimg\" src=\"images/happy1.png\">";
            }

        },
        function(error) {
            console.log('Error:' + error);
        });
    },
    function(error) {
        console.log('Error showEventList: ' + error);
    },
    function() {
        console.log('Success showEventList');
        
        console.log(event_line);
        document.getElementById('event_list').innerHTML = event_line;
        document.getElementById('modal_del_id').innerHTML = modal_html;
    });
}

function showPList() {
    var urlWithParams = window.location.href;
    var eid = getParameterByName('e', urlWithParams);

    var modal_html = "";
    var p_line = "<table class=\"table table-bordred \"> <thead><th>Medicine</th><th>Next Alarm</th><th>Remaining</th><th></th></thead><tbody>";
    console.log("showEventList pasok!");
    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM prescription WHERE interval_times>=1 and e_id="+eid;
        transaction.executeSql(executeQuery, [], function(tx, result) {
            var len = result.rows.length;

            for(i=0; i<len; i++) {
                p_line = p_line + "<tr><td>"+result.rows.item(i).pmed_id+"</td><td>"+result.rows.item(i).next_alarm+"</td><td>"+result.rows.item(i).interval_times+"</td>";
                p_line = p_line + "<td><p data-placement=\"top\"  title=\"Delete\"><button class=\"btn btn-danger btn-xs\" data-title=\"Delete\" data-toggle=\"modal\" data-target=\"#delete"+result.rows.item(i).presc_id+"\" ><span class=\"glyphicon glyphicon-trash\"></span></button></p></td>";
                p_line = p_line + "</tr>";

                modal_html = modal_html + modalDivAlarm(result.rows.item(i).presc_id);
            }
        },
        function(error) {
            console.log('Error:' + error);
        });
    },
    function(error) {
        console.log('Error showPList: ' + error);
    },
    function() {
        console.log('Success showPList');
        p_line = p_line + " </tbody></table>"
        document.getElementById('plist_id').innerHTML = p_line;
        document.getElementById('modal_del_id').innerHTML = modal_html;
    });
}

function showHistList() {
    var hist_line = "<table class=\"rwd-table table-responsive\"><tr><th>Date</th><th>Info</th></tr>";
    console.log("showEventList pasok!");
    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM logs";
        transaction.executeSql(executeQuery, [], function(tx, result) {
            var len = result.rows.length;

            for(i=0; i<len; i++) {
                hist_line = hist_line + "<tr><td data-th=\"Date\">"+result.rows.item(i).start_date+"</td><td data-th=\"Info\">"+result.rows.item(i).generated_text+"</td></tr>";
            }
        },
        function(error) {
            console.log('Error:' + error);
        });
    },
    function(error) {
        console.log('Error showHistList: ' + error);
    },
    function() {
        console.log('Success showHistList');
        hist_line = hist_line + "</table>"
        document.getElementById('hist_list').innerHTML = hist_line;
    });
}


function modalDiv(idnum) {
    var modal_line = "<div class=\"modal fade\" id=\"delete"+idnum+"\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"edit\" aria-hidden=\"true\">";
    modal_line = modal_line + "<div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-header\">";
    modal_line = modal_line + "<button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\"><span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span></button>";
    modal_line = modal_line + "<h4 class=\"modal-title custom_align\" id=\"Heading\">Delete Event</h4>";
    modal_line = modal_line + "</div><div class=\"modal-body\"><div class=\"console.log console.log-danger\"><span class=\"glyphicon glyphicon-warning-sign\"></span> Are you sure you want to delete this alarm?</div>";
    modal_line = modal_line + "</div><div class=\"modal-footer \"><button type=\"button\" class=\"btn btn-success\" data-dismiss=\"modal\" onclick=\"deleteEvent("+idnum+")\"><span class=\"glyphicon glyphicon-ok-sign\"></span> Yes</button>";
    modal_line = modal_line + "<button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\"><span class=\"glyphicon glyphicon-remove\"></span> No</button></div></div></div></div>";
    return modal_line;
}

function modalDivAlarm(idnum) {
    var modal_line = "<div class=\"modal fade\" id=\"delete"+idnum+"\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"edit\" aria-hidden=\"true\">";
    modal_line = modal_line + "<div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-header\">";
    modal_line = modal_line + "<button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\"><span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span></button>";
    modal_line = modal_line + "<h4 class=\"modal-title custom_align\" id=\"Heading\">Delete Alarm</h4>";
    modal_line = modal_line + "</div><div class=\"modal-body\"><div class=\"console.log console.log-danger\"><span class=\"glyphicon glyphicon-warning-sign\"></span> Are you sure you want to delete this alarm?</div>";
    modal_line = modal_line + "</div><div class=\"modal-footer \"><button type=\"button\" class=\"btn btn-success\" data-dismiss=\"modal\" onclick=\"deleteAlarm("+idnum+")\"><span class=\"glyphicon glyphicon-ok-sign\"></span> Yes</button>";
    modal_line = modal_line + "<button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\"><span class=\"glyphicon glyphicon-remove\"></span> No</button></div></div></div></div>";
    return modal_line;
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function errorHandler() {
    console.log("There is error");
}

function nullHandler() {
    //nothing
}

function successCb() {
    console.log("This is success");
}


    


