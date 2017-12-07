document.addEventListener("deviceready", onDeviceReady, false);
var db = null;
function onDeviceReady() {
	db = window.sqlitePlugin.openDatabase({name: "med_alarm_db.db", location: 2});
	db.transaction(function(tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS event(event_id integer PRIMARY KEY AUTOINCREMENT, event_name varchar(30), event_desc text)',[],nullHandler,errorHandler);
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
		tx.executeSql('CREATE TABLE IF NOT EXISTS prescription(presc_id integer PRIMARY KEY AUTOINCREMENT, med_name varchar(30), next_alarm varchar(8), hrs_dur integer, mins_dur integer, interval_times integer, e_id integer REFERENCES event(idnum))',[],nullHandler,errorHandler);
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

function addEvent() { //fiiiiiiiiiiixxeeeed!
	alert("Addevent is clicked!");
	db.transaction(function(transaction) {
		var new_event_name = document.getElementById('eventname');
		var new_event_desc = document.getElementById('eventdesc');
		var executeQuery = "INSERT INTO event (event_name, event_desc) VALUES (?,?)";
		transaction.executeSql(executeQuery, [new_event_name, new_event_desc],nullHandler,errorHandler);

	},
	function (error) {
		alert('Error' + error);
	},
	function() {
		alert('Success event: ' );
		window.location = "alarm.html";
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
		var executeQuery = "INSERT INTO prescription (med_name, next_alarm, hrs_dur, mins_dur, interval_times, e_id) VALUES (?,?,?,?,?,?)";
		transaction.executeSql(executeQuery, [meds, nextAlarm, hrs, mins, times, recentNewEventId],nullHandler,errorHandler);
	},
	function (error) {
		alert('Error' + error);
	},
	function() {
		alert('Success addAlarmToDB');
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
        		newLine = newLine + result.rows.item(i).med_name + ": " + result.rows.item(i).next_alarm + ", " + result.rows.item(i).interval_times + " more times.<br>";
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


function checkAlarm(cuttime) {
	db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM prescription";
        
        transaction.executeSql(executeQuery, [], function(tx, result) {
        	var presc_len = result.rows.length;
        	for(i=0; i<presc_len; i++) {
        		 if((result.rows.item(i).next_alarm == cuttime) && (result.rows.item(i).interval_times>0)) {
        		 	alert("Drink your medicine");
        		 	updateNextAlarm(result.rows.item(i).presc_id);
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
    });

}


function updateNextAlarm(alarm_index) {
	var temp_array = [];
	db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM prescription WHERE presc_id=" + alarm_index;
        
        transaction.executeSql(executeQuery, [], function(tx, result) {
        	temp_array.push(result.rows.item(0).next_alarm);
        	temp_array.push(result.rows.item(0).med_name);
        	temp_array.push(result.rows.item(0).hrs_dur);
        	temp_array.push(result.rows.item(0).mins_dur);
        	temp_array.push(result.rows.item(0).interval_times);
    	  	
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
        setAlarm(new Date(), temp_array, 'u');
        setNextAlarm(alarm_index, temp_array[0]);        
    });

}

function setNextAlarm(alarm_index, new_next_alarm) {
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

function errorHandler() {
	alert("There is error");
}

function nullHandler() {
	//nothing
}

function successCb() {
	alert("This is success");
}
