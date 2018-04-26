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

router.get("/myorder", restrict, function(request, response){
  var post = request.body;
  connection.query('SELECT TDATE, TStatus, CCNumber, STREET, CITY, COUNTRY, PNAME, PPrice, Quantity FROM (CART NATURAL JOIN APPEARS_IN NATURAL JOIN PRODUCT JOIN SHIPPING_ADDRESS ON CART.CID = SHIPPING_ADDRESS.CID) ORDER BY TDATE DESC;');
  if(error)
    throw error;
  else{
    response.render('myorder',{orderResults: "My Orders"});
  }
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
			    res.send({ success: true, url: 'http://picklepeople.mynetgear.com:81/order/' + cart_id });
			    delete cartHandler.user[req.session.user];
			});
		    });
		});
	    });
	});
    });
});


router.get('/order', restrict, (req, res, next) => {
    connection.query('SELECT CartID, SAName, TStatus, TDate FROM CART WHERE CID = ?', [req.session.user], (error, results, fields) => {
	if (error) throw error;
	res.render('orderlist', { orders: results });
    });
});

/* GET order detail page */
router.get('/order/:cartID', restrict, (req, res, next) => {
    connection.query('SELECT TDate, TStatus, CCNumber, SAName FROM CART WHERE CartID = ?; SELECT PName, Quantity, PriceSold FROM APPEARS_IN NATURAL JOIN PRODUCT WHERE CartID = ?; ', [req.params.cartID, req.params.cartID], function(error, results, fields) {
	if (error) throw error;
	results[1] = results[1].map((row) => {
	    row.TDate = results[0][0].TDate;
	    row.TStatus = results[0][0].TStatus;
	    row.CCNumber = results[0][0].CCNumber;
	    row.SAName = results[0][0].SAName;
	    return row;
	});

	var order = results[1];

	connection.query('SELECT Street, SNumber, City, Country FROM SHIPPING_ADDRESS WHERE SAName = ? AND CID = ?', [order[0].SAName, req.session.user], function(error, results, fields) {
	    console.log(results);
	    order = order.map((row) => {
		row.Street = results[0].Street + ' ' + results[0].SNumber;
		row.City = results[0].City;
		row.Country = results[0].Country;
		return row;
	    });
	    res.render('myorder', { orderResults: order });
	});
    });
});


/* GET analytics page */
router.get('/analytics', (req, res, next) => {
    res.render('analytics');
});

/* POST to analytics page */
router.post('/analytics', (req, res, next) => {
console.log(req.body);
    var query1 = 'SELECT PID, SUM(Quantity) as total FROM APPEARS_IN WHERE CartID IN (SELECT CartID FROM CART WHERE TDate >= ? and TDate <= ?) GROUP BY PID ORDER BY SUM(Quantity) DESC LIMIT 1; ';
    var query2 = 'SELECT PID, COUNT(*) as total FROM (SELECT CID, PID FROM CART JOIN APPEARS_IN ON CART.CartID=APPEARS_IN.CartID WHERE TDate >= ? and TDate <= ? GROUP BY CID, PID) as T1 GROUP BY PID ORDER BY COUNT(*) DESC LIMIT 1; ';
    var query3 = 'SELECT CID, SUM(PriceSold*Quantity) as total FROM CART JOIN APPEARS_IN ON CART.CartID=APPEARS_IN.CartID WHERE TDate >= ? and TDate <= ? GROUP BY CID ORDER BY SUM(PriceSold*Quantity) DESC LIMIT 10; ';
    var query4 = 'SELECT Zip, COUNT(CartID) AS num_shipments FROM (SELECT * FROM CART WHERE TStatus = "shipped" AND (TDate >= ? AND TDate <= ?)) AS T1 JOIN SHIPPING_ADDRESS AS SA ON SA.CID = T1.CID AND SA.SAName = T1.SAName GROUP BY Zip ORDER BY num_shipments DESC LIMIT 5; ';
    var query5 = 'SELECT PType, AVG(PriceSold) AS average_selling_price FROM (SELECT * FROM CART WHERE TDate >= ? AND TDate <= ?) AS C JOIN APPEARS_IN AS A ON C.CartID = A.CartID JOIN PRODUCT AS P ON P.PID = A.PID GROUP BY PType';
    connection.query(query1 + query2 + query3 + query4 + query5, [req.body.date_begin, req.body.date_end, req.body.date_begin, req.body.date_end, req.body.date_begin, req.body.date_end, req.body.date_begin, req.body.date_end, req.body.date_begin, req.body.date_end], function(error, results, fields) {
	res.send({ query1: results[0],
		   query2: results[1],
		   query3: results[2],
		   query4: results[3],
		   query5: results[4] });
	
    });
});

module.exports = router;
