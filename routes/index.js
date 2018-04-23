var express = require('express');
var router = express.Router();
var user_info = require('../src/user_input');
var mysql = require("mysql");
var session = require('express-session');

var connection = mysql.createConnection({
    host: "localhost",
    user: "faizan",
    password: "GehaniTime70",
    database: "cs631",
    multipleStatements: true
});

function restrict(req, res, next) {
    if (req.session.user) {
	next();
    } else {
	req.session.error = 'Access denied!';
	res.redirect('/login');
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/* GET restricted test page */
router.get('/test', restrict, function(req, res) {
    res.send('you are authenticated');
});

/* GET cart page */
router.get('/cart', function(req, res, next) {
    res.render('cart', { cartItems: [{itemName: 'cart item', itemPrice: '$1.23'}, {itemName: 'another item', itemPrice: '$1.23'}, {itemName: 'last item', itemPrice: '$1.23'}] });
});


/* GET registration page */
router.get('/registration', function(req, res, next) {
    res.render('register', { title: 'Registration' });
});


/* GET categories page */
router.get("/categories", function(request,response){
    var post = request.body;

    // connection.connect(function(err) {
    // 	if(err) throw err;
    // 	console.log("Connected");
	connection.query('SELECT * FROM COMPUTER NATURAL JOIN PRODUCT WHERE NOT PType="laptop"; SELECT * FROM LAPTOP JOIN PRODUCT; SELECT * FROM PRINTER NATURAL JOIN PRODUCT;', function(error, results, fields) {
	    if(error){
		throw error;
	    }
	    else{
		console.log("SucSAAAAAAAXX");
		response.render('categories', {page_title: "Categories", computerResults: results[0], laptopResults: results[1], printerResults: results[2]});
	  }
	});
    // });
});

/* POST registration page */
router.post('/registration', function(req, res, next) {
    console.log(req.body);
    console.log(user_info);
    if (!user_info.validate_registration(req.body)) {
    	console.log('not validated');
    	res.json({ success: false });
    } else {
	// connection.connect(function(err) {
	//     if (err) {
	// 	console.error('error connecting: ' + err.stack);
	// 	return;
	//     }

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
	// });
    }
});

module.exports = router;
