document.addEventListener("deviceready", onDeviceReady, false);
var db = null;
function onDeviceReady() {
	console.log("Here");
	//db = window.openDatabase("med_alarm_db.db", "1.0", "med alarm db", 1000000)
	db = window.sqlitePlugin.openDatabase({name: "med_alarm_db.db", location: 1});
	console.log("Here too");

}

function createUser() {
	
	db.transaction(function(transaction) {
		var fname = document.getElementById('fname').value;
		var mname = document.getElementById('mname').value;
		var lname = document.getElementById('lname').value;
		var email_ad = document.getElementById('email').value;
		var gender = document.getElementById('gender').value;
		var age = document.getElementById('age').value;
		console.log(fname);
		var executeQuery = "INSERT INTO user (fname, mname, lname, age, email_ad, gender, key_id) VALUES (?,?,?,?,?,?)";
		transaction.executeSql(executeQuery, [fname, mname, lname, age, email_ad, gender, 10001]);
	},
	function () {
		//var sample_name;
		db.transaction(function(transaction) {
			transaction.executeSql('SELECT * FROM user', [], function(tx, results) {
				var sample_name = results.rows.item(0).fname;
				alert(sample_name);
			});
		},
		function(error){
			//something error
		});
		
	},
	function(error) {
		alert('Error');
	});
}

function display() {

}