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
    user: {},
    add_item: function(cid, product) {
	if(parseInt(product.Quantity) < 1) return;
	
	if (!this.user.hasOwnProperty(cid)) {
	    this.user[cid] = {};

	}
	
	if (!this.user[cid].hasOwnProperty(product.PID)) {
	    this.user[cid][product.PID] = parseInt(product.Quantity);
	} else {
	    this.user[cid][product.PID] += parseInt(product.Quantity);
	}
	return;
    },
    remove_item: function(cid, product) {
	delete this.user[cid][product.PID];
	return;
    },
    change_quantity: function(cid, product) {
	if (this.user.hasOwnProperty(cid) && this.user.hasOwnProperty[cid][product.PID]) {
	    this.user[cid][PID] = product.Quantity;
	}
	return;
    },
    get_cart: function(cid) {
	console.log('entered function');
	if (!this.user.hasOwnProperty(cid) || Object.keys(this.user[cid]).length === 0)
	    return 'empty';

	console.log('checked items');
	var product_list = [];

	Object.keys(this.user[cid]).forEach((element) => {
	    product_list.push({ PID: element, Quantity: this.user[cid][element] });
	});
	console.log('looped through keys');
	
	return product_list;
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


/* GET cart page */
router.get('/cart', restrict, function(req, res, next) {
    var cart_list = cartHandler.get_cart(req.session.user);

    if (cart_list == 'empty') {
	res.render('cart');
	return;
    }

    var query_string = "SELECT PID, PName as itemName, PPRice as itemPrice, ? as Quantity FROM PRODUCT WHERE PID = ?; ";
    var final_query = "";
    var query_params = [];

    for(let i = 0; i < cart_list.length; i++) {
	final_query += query_string;
	query_params.push(cart_list[i].Quantity);
	query_params.push(cart_list[i].PID);
    }

    console.log(final_query);
    console.log(query_params);

    connection.query(final_query, query_params, function(error, results, fields) {
	if(error) throw error;
	console.log(results);
	if (results.length > 1) {
	    results = results.map((element) => {
		return element[0];
	    });
	}
	res.render('cart', { cartItems: results });
    });
});


/* GET registration page */
router.get('/registration', function(req, res, next) {
    res.render('register', { title: 'Registration' });
});


/* GET categories page */
router.get("/categories", restrict, function(request,response){
    var post = request.body;

    // connection.connect(function(err) {
    // 	if(err) throw err;
    // 	console.log("Connected");
    connection.query('SELECT * FROM COMPUTER NATURAL JOIN PRODUCT WHERE NOT PType="laptop"; SELECT * FROM LAPTOP NATURAL JOIN PRODUCT; SELECT * FROM PRINTER NATURAL JOIN PRODUCT;', function(error, results, fields) {
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


/* GET address confirmation page */
router.get('/confirmaddress', restrict, function(req, res, next) {
    connection.query('SELECT SAName, RecipientName, Street, SNumber, City, Country, Zip FROM SHIPPING_ADDRESS WHERE CID = 0', function(error, results, fields) {
	if (error) throw error;
	res.render('confirmaddress', { addresses: results });
    });
});


/* GET address confirmation page */
router.get('/confirmcreditcard/:saname', restrict, function(req, res, next) {
    connection.query('SELECT COUNT(*) FROM SHIPPING_ADDRESS WHERE CID = ? AND SAName = ?', [req.session.user, req.params.saname], function(error, results, fields) {
	if(error){
	    res.redirect('/confirmaddress');
	    throw error;
	} else if (results[0]['COUNT(*)'] === 0) {
	    res.redirect('/confirmaddress');
	} else {
	    connection.query('SELECT CCNumber, OwnerName, CCType, CCAddress FROM STORED_CARD NATURAL JOIN CREDIT_CARD WHERE CID = ?', [req.session.user], function(error, results, fields) {
		if(error) throw error;
		results = results.map((element) => {
		    element.CCID = element.CCNumber;
		    element.CCNumber = element.CCNumber.slice(-4);
		    return element;
		});
		res.render('confirmcreditcard', { cards: results });
	    });
	}
    });
});


/* POST cart management */
/* MISSING REDIRECT ON FAILURE */
router.post('/cart/:action', function(req, res, next) {
    if (req.session.user === undefined) return;
    
    if (req.params.action === 'add') {
    	cartHandler.add_item(req.session.user, req.body);
	res.send({success: true});
    } else if (req.params.action === 'remove') {
    	cartHandler.remove_item(req.session.user, req.body);
	res.send({success: true});
    } else if (req.params.action === 'list') {
	res.send(cartHandler.get_cart(req.session.user));
    }
});


router.post('/purchase', function(req, res, next) {
    if (req.session.user === undefined) return;


    connection.beginTransaction(function(err) {
	if (err) throw err;


	var cart_list = cartHandler.get_cart(req.session.user);
	console.log(cart_list);
	
	// subtract quantity from PQuantity
	var subtract_query = 'UPDATE PRODUCT SET PQuantity = PQuantity - ? WHERE PID = ?; ';
	var price_query = 'SELECT PPRice FROM PRODUCT WHERE PID = ?; ';
	var final_query = '';
	var final_price_query = '';
	var query_params = [];
	var pids = [];

	for(let i = 0; i < cart_list.length; i++) {
	    final_query += subtract_query;
	    query_params.push(cart_list[i].Quantity);
	    query_params.push(cart_list[i].PID);
	    pids.push(cart_list[i].PID);
	    final_price_query += `SELECT PPRice, PID, ${cart_list[i].Quantity} as Quantity FROM PRODUCT WHERE PID = ?; `;
	}

	connection.query(final_query, query_params, function(error, results, fields) {
	    if (error) {
		return connection.rollback(function() {
		    throw error;
		});
	    }

	    // add cart
	    connection.query('INSERT INTO CART (CID, SAName, CCNumber, TDate) VALUES (?, ?, ?, NOW())', [req.session.user, req.body.SAName, req.body.CCNumber], function(error, results, fields) {
		if (error) {
		    return connection.rollback(function() {
			throw error;
		    });
		}
		var cart_id = results.insertId;


		// get the price for each value
		connection.query(final_price_query, pids, function(error, results, fields) {
		    if (error) {
			return connection.rollback(function() {
			    throw error;
			});
		    }
		    
		    if (results.length > 1) results = results.map((element) => { return element[0] });

		    // add to APPEARS_IN
		    var appears_in_query = 'INSERT INTO APPEARS_IN (CartID,PID,Quantity,PriceSold) VALUES (' + cart_id + ',?,?,?); ';
		    var query_params = [];
		    var final_appears_query = '';

		    console.log(results[0]);
		    
		    for(let i = 0; i < results.length; i++) {
			final_appears_query += appears_in_query;
			query_params.push(results[i].PID);
			query_params.push(results[i].Quantity);
			query_params.push(results[i].PPRice);
		    }

		    console.log(final_appears_query);

		    connection.query(final_appears_query, query_params, function(error, results, fields) {
			if (error) {
			    return connection.rollback(function() {
				throw error;
			    });
			}

			connection.commit(function(err) {
			    if (err) {
				return connection.rollback(function() {
				    throw err;
				});
			    }
			    console.log('success');
			    delete cartHandler.user[req.session.user];
			});
		    });
		});		
	    });
	});
    });
});


module.exports = router;
