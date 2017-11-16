document.addEventListener("deviceready", onDeviceReady, false);
var db = null;
function onDeviceReady() {
	db = window.sqlitePlugin.openDatabase({name: "med_alarm_db.db", location: 2});
	db.transaction(function(tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS user(fname varchar(15), mname varchar(15), lname varchar(15), age integer, email_ad varchar(25), gender varchar(6), key_id integer PRIMARY KEY)',[],nullHandler,errorHandler);
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
	}
}


function createUser() { 
	
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
			alert("Added new user:" + result.rows.item(0).lname + ", " + result.rows.item(0).fname + " (" + result.rows.item(0).email_ad + ").");
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
                window.location="register.html";
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

function errorHandler() {
	alert("There is error");
}

function nullHandler() {
	//nothing
}

function successCb() {
	alert("This is success");
}
