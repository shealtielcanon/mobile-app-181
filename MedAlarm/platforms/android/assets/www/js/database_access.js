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
		checkEvent();
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
	alert("Accessed!");
	var recentNewEventId = getLastId();
	db.transaction(function(transaction) {
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
	db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM prescription";
        transaction.executeSql(executeQuery, [], function(tx, result) {
            var p_number = result.rows.length;
            for(i=0; i<p_number;i++){
            	id_array.push(result.rows.item(i).presc_id);
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
        console.log('Success getPrescIdArray()');
    });

    return id_array;

}

function getPrescAlarmArray(alarm_index) {
	var alarm_array=[];
	db.transaction(function(transaction) {
        var executeQuery = "SELECT * FROM prescription";
        transaction.executeSql(executeQuery, [], function(tx, result) {
        	alarm_array.push(result.rows.item(alarm_index).next_alarm);
        	alarm_array.push(result.rows.item(alarm_index).hrs_dur);
        	alarm_array.push(result.rows.item(alarm_index).mins_dur);
        	alarm_array.push(result.rows.item(alarm_index).interval_times);
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

    return alarm_array;
}

function updateNextAlarm(alarm_index, new_next_alarm) {
	db.transaction(function(transaction) {
		var executeQuery = "UPDATE prescription SET next_alarm=?, interval_times=interval_times-1 WHERE presc_id=?";
		transaction.executeSql(executeQuery, [new_next_alarm, alarm_index],nullHandler,errorHandler);
	},
	function (error) {
		alert('Error' + error);
	},
	function() {
		alert('Success insert');
	});

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

function errorHandler() {
	alert("There is error");
}

function nullHandler() {
	//nothing
}

function successCb() {
	alert("This is success");
}
