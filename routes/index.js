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

// PID, and Quantity
var cartHandler = {
    items: {},
    add_item: function(cid, item) {
	return;
    },
    remove_item: function(cid, item) {
	return;
    },
    change_quantity: function(cid, pid) {
	return;
    },
    get_cart: function(cid) {
	return;
    }
};

function restrict(req, res, next) {
    if (req.session.user === 0 || req.session.user) {
	next();
    } else {
	req.session.error = 'Access denied!';
	res.redirect('/');
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('login', { title: 'Express' });
});

/* GET restricted test page */
router.get('/test', restrict, function(req, res) {
    res.send('you are authenticated');
});

/* GET cart page */
router.get('/cart', restrict, function(req, res, next) {
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
		    res.json({ success: true });
		}
	    });

	    console.log('connected as id ' + connection.threadId);
	// });
    }
});

/* POST login */
router.post('/login', function(req, res, next) {
    connection.query('SELECT CID FROM CUSTOMER WHERE EMail = ' + connection.escape(req.body.EMail) + 'AND Password = ' + connection.escape(req.body.Password), function(error, results, fields) {
	if(error){
	    res.json({ success: false });
	    throw error;
	}
	else{
	    req.session.user = results[0].CID;
	    res.json({ success: true });
	}
    });
});


/* GET account page */
router.get('/account', restrict, function(req, res, next) {
    res.render('account');
});

module.exports = router;
