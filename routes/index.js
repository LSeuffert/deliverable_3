var express = require('express');
var router = express.Router();
var user_info = require('../src/user_input');
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    user: "faizan",
    password: "GehaniTime70",
    database: "cs631"
});


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/* GET registration page */
router.get('/registration', function(req, res, next) {
    res.render('register', { title: 'Registration' });
});


/* POST registration page */
router.post('/registration', function(req, res, next) {
    console.log(req.body);
    console.log(user_info);
    if (!user_info.validate_registration(req.body)) {
    	console.log('not validated');
    	res.json({ success: false });
    } else {
	connection.connect(function(err) {
	    if (err) {
		console.error('error connecting: ' + err.stack);
		return;
	    }

	    connection.query('INSERT INTO CUSTOMER SET ?', req.body, function(error, results,fields) {
		if(error){
		    res.json({ success: false });
		    throw error;
		}
		else{
		    console.log("SucSAAAAAAAXX");
		    res.json({ success: true });
		}
	    });

	    console.log('connected as id ' + connection.threadId);
	});
    }
});

module.exports = router;
