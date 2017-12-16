document.addEventListener("deviceready", onDeviceReady, false);
var db = null;
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
        alert("Database is not ready, error: " + error);
    },
    function() {
        alert("Database is ready");
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
        tx.executeSql('CREATE TABLE IF NOT EXISTS prescription(presc_id integer PRIMARY KEY AUTOINCREMENT, pmed_id integer REFERENCES Medicine(Med_id), next_alarm varchar(8), hrs_dur integer, mins_dur integer, interval_times integer, e_id integer REFERENCES event(event_id), next_alarm_date date, is_one_day_alarm boolean)',[],nullHandler,errorHandler);
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
        //checkEvent();
        showAlarmList();
    }

}


function checkEvent(){
     db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM event";
        alert("checkEvent");
        transaction.executeSql(executeQuery, [], function(tx, result) {
            alert(result.rows.length);
        },
        function(error) {
            alert('Error:' + error);
        });
    },
    function(error) {
        alert('Error transaction: ' + error);
    },
    function() {
        alert('Success transaction');
    });
}

function addEvent() { //check and debug this!
    alert("Addevent is clicked!");
    db.transaction(function(transaction) {
        var new_event_name = document.getElementById('addillnessinput');
        var new_event_desc = document.getElementById('addillnessarea');
        var executeQuery = "INSERT INTO event (event_name, event_desc, start_date, is_running) VALUES (?,?, date('now'), 1)";
        transaction.executeSql(executeQuery, [new_event_name, new_event_desc],nullHandler,errorHandler);

    },
    function (error) {
        alert('Error' + error);
    },
    function() {
        alert('Success event: ' );
        //window.location = "alarm3.html";
        var last_id = getLastId();
        newLogEntry(last_id);
    });
    
}

function getLastId() {
    var temp_id=0;

    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM event";
        transaction.executeSql(executeQuery, [], function(tx, result) {
            temp_id = result.rows.length;
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

    //alert("Wow");
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
            alert("Added new user: " + result.rows.item(0).lname + ", " + result.rows.item(0).fname + " (" + result.rows.item(0).email_ad + ").");
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
    alert("Checking for registered user...");
    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM user";
        transaction.executeSql(executeQuery, [], function(tx, result) {
            var userNumber = result.rows.length;
            if(userNumber==0) {
                alert("No user found. Please register.");
                window.location="index2.html";
            }
            else {
                alert("A user is found. Loading user with name " + result.rows.item(0).lname);
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
    alert("Accessed! " + nextAlarm + ", " + meds + ", " + hrs + ", " + mins + ", " + times);
    var recentNewEventId = getLastId();
    db.transaction(function(transaction) {
        alert('Here daw!');
        var executeQuery;
        if(hrs==24){
            executeQuery = "INSERT INTO prescription (pmed_id, next_alarm, hrs_dur, mins_dur, interval_times, e_id, next_alarm_date, is_one_day_alarm) VALUES (?,?,?,?,?,?, date('now', '+1 day'), 1)"
        }
        else{
            executeQuery = "INSERT INTO prescription (pmed_id, next_alarm, hrs_dur, mins_dur, interval_times, e_id, is_one_day_alarm) VALUES (?,?,?,?,?,?, 0)"
        }
        transaction.executeSql(executeQuery, [meds, nextAlarm, hrs, mins, times, recentNewEventId],nullHandler,errorHandler);
    },
    function (error) {
        alert('Error' + error);
    },
    function() {
        alert('Success addAlarmToDB');
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
            //alert("presc_len: " + presc_len);
            for(i=0; i<presc_len; i++) {
                alert("presc_id.pushing - " + result.rows.item(i).presc_id);
                id_array.push(result.rows.item(i).presc_id);
            }
            
        },
        function(error) {
            alert('Error:' + error);
        });
    },
    function(error) {
        alert('Error getPrescIdArray: ' + error);
    },
    function() {
        alert('Success getPrescIdArray');
        id_array.forEach(function(item, index, array) {
            return_array.push(item);
        });
        
    });

    alert("return_array[1]: " + return_array[1]);
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
            alert('Error:' + error);
        });
    },
    function(error) {
        alert('Error getPrescAlarmArray: ' + error);
    },
    function() {
        alert('Success getPrescAlarmArray');
    });
    return alarm_array;
}



function getAlarmLastId() {
    var temp_id=0;

    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM event";
        transaction.executeSql(executeQuery, [], function(tx, result) {
            alert("LENGTH: "+ result.rows.length);
            temp_id = result.rows.length;
        },
        function(error) {
            alert('Error (getLastId):' + error);
        });
    },
    function(error) {
        alert('Error transaction (getAlarmLastId): ' + error);
    },
    function() {
        alert('Success getAlarmLastId');
        
    });
    alert("temp_a_id: " + temp_id);
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
            alert('Error:' + error);
        });
    },
    function(error) {
        alert('Error showAlarmList: ' + error);
    },
    function() {
        alert('Success showAlarmList');
        alert('alarmLength: ' + alarmLength);
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
function checkAlarm(cuttime) {
    var row_id;
    var willUpdate=false, willSnooze=false;
    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM prescription";
        
        transaction.executeSql(executeQuery, [], function(tx, result) {
            var presc_len = result.rows.length;
            var med_alert;
            for(i=0; i<presc_len; i++) {
                 if((result.rows.item(i).next_alarm == cuttime) && (result.rows.item(i).interval_times>0)) {
                    if(result.rows.item(i).is_one_day_alarm==1) {
                        if(result.rows.item(i).next_alarm_date==currentDate()){
                            med_alert = result.rows.item(i).med_name;
                            cordova.plugins.notification.local.schedule({
                                id: 123,
                                title: 'Drink your medicine',
                                text: 'Drink '+ med_alert,
                                foreground: true
                            });
                        }
                    }
                    else{
                        med_alert = result.rows.item(i).med_name;
                        cordova.plugins.notification.local.schedule({
                            id: 123,
                            title: 'Drink your medicine',
                            text: 'Drink '+ med_alert,
                            foreground: true
                        });
                    }
                    
                    
                    row_id = result.rows.item(i).presc_id;
                    cordova.plugins.notification.local.on("click", function (notification, state) {
                        navigator.notification.confirm(
                            'Drink' + med_alert,
                             function(buttonIndex) {
                                if(buttonIndex==1) {
                                    willUpdate=true;
                                }
                                else {
                                    willSnooze=true;
                                }
                             },            
                            'Drink your medicine',
                            ['Drink','Snooze']     
                        );
                        
                    }, this);
                    alert("Drink your " + med_alert);
                    
                 }
            }
            
        },
        function(error) {
            alert('Error:' + error);
        });
    },
    function(error) {
        console.log('Error checkAlarm: ' + error);
    },
    function() {
        console.log('Success checkAlarm');
        if(willUpdate) {
            updateNextAlarm(row_id, 'u');
        }

        else if(willSnooze) {
             updateNextAlarm(row_id, 'sn');
        }        
    });

}

function deleteEvent(ev_id) {
    db.transaction(function(transaction) {
        var executeQuery = "UPDATE event SET is_running=0 WHERE presc_id=ev_id";
        transaction.executeSql(executeQuery, [],nullHandler,errorHandler);
    },
    function (error) {
        alert('Error' + error);
    },
    function() {
        alert('Success deleteEvent');
    });
}




function snooze(alarm_index,new_next_alarm) {
    db.transaction(function(transaction) {
        var executeQuery = "UPDATE prescription SET next_alarm=? WHERE presc_id=?";
        transaction.executeSql(executeQuery, [new_next_alarm, alarm_index],nullHandler,errorHandler);
    },
    function (error) {
        alert('Error' + error);
    },
    function() {
        alert('Success snooze');
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
            alert('Error:' + error);
        });
    },
    function(error) {
        alert('Error checkAlarm: ' + error);
    },
    function() {
        alert('Success updateNextAlarm');
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
        alert('Error' + error);
    },
    function() {
        alert('Success update next alarm date');
    });
}

function setNextAlarm(alarm_index, new_next_alarm) {//update for 24 hours alarms
    db.transaction(function(transaction) {
        var executeQuery = "UPDATE prescription SET next_alarm=?, interval_times=interval_times-1 WHERE presc_id=?";
        transaction.executeSql(executeQuery, [new_next_alarm, alarm_index],nullHandler,errorHandler);
    },
    function (error) {
        alert('Error' + error);
    },
    function() {
        alert('Success update');
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
            alert('Error:' + error);
        });
    },
    function(error) {
        alert('Error showMeds: ' + error);
    },
    function() {
        alert('Success showMeds');
        document.getElementById('med_option_id') = med_option;
    });

}

function newLogEntry(ev_id) { //check and debug this!
    alert("newLogEntry is clicked!");
    db.transaction(function(transaction) {
        var executeQuery = "INSERT INTO logs (e_id, start_date) VALUES (?,date('now'))";
        transaction.executeSql(executeQuery, [ev_id],nullHandler,errorHandler);

    },
    function (error) {
        alert('Error' + error);
    },
    function() {
        alert('Success log new event: ' );
        window.location = "alarm3.html";
    });
}

function updateLogText(ev_id, added_text) {
    db.transaction(function(transaction) {
        var executeQuery = "UPDATE logs SET generated_text = generated_text || ? || "+"','"+" WHERE e_id=?";
        transaction.executeSql(executeQuery, [ev_id, added_text],nullHandler,errorHandler);
    },
    function (error) {
        alert('Error' + error);
    },
    function() {
        alert('Success updateLogText');
    });

}

function search() {
    var search_result = document.getElementById('search_id').value;
    db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM Medicine WHERE LOWER(GenericName) LIKE LOWER('%"+search_result+"%')";
        alert(executeQuery);
        transaction.executeSql(executeQuery, [], function(tx, result) {
            var len = result.rows.length;
            alert(result.rows.item(0).GenericName);
        },
        function(error) {
            alert('Error:' + error);
        });
    },
    function(error) {
        alert('Error search: ' + error);
    },
    function() {
        alert('Success search');
    });
}

function errorHandler() {
    alert("There is error");
}

function nullHandler() {
    //nothing
}

function successCb() {
    alert("This is success");
}
