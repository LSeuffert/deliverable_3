var form = document.getElementById("date_form");
form.onsubmit = function(e) {
	e.preventDefault();

    var beg_year = form.beg_year.value;
    var beg_month = form.beg_month.value;
    var beg_day = form.beg_day.value;
    var beg_date = beg_year + "-" + beg_month + "-" + beg_day;

    var end_year = form.end_year.value;
    var end_month = form.end_month.value;
    var end_day = form.end_day.value;
    var end_date = end_year + "-" + end_month + "-" + end_day;

	var date_form_json_object = {
	    "date_begin": beg_date,
	    "date_end": end_date
	}

    console.log(date_form_json_object);

    var data = JSON.stringify(date_form_json_object);

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
	if (this.readyState === 4) {
	    var res = JSON.parse(this.responseText);
	    buildTable(res.query1, 'query1', ['PID', 'total']);
	    buildTable(res.query2, 'query2', ['PID', 'total']);
	    buildTable(res.query3, 'query3', ['CID', 'total']);
	    buildTable(res.query4, 'query4', ['Zip', 'num_shipments']);
	    buildTable(res.query5, 'query5', ['PType', 'average_selling_price']);
	}
    });

    xhr.open("POST", "http://picklepeople.mynetgear.com:81/analytics");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.setRequestHeader("Postman-Token", "66a3b1b4-9aea-4b12-9cfc-ef1a983a2b01");

    xhr.send(data);
};

function buildTable(queryResults, tableId, keys) {
    if (queryResults.length < 1) return;
    
    var html_results = '<tr>';

    keys.forEach(function (k) {
    	html_results += '<th>' + k + '</th>';
    });
    
    queryResults.forEach(function (result) {
    	html_results += '<tr>';
	keys.forEach(function(k) {
    	    html_results += '<td>' + result[k] + '</td>';
    	});
    });
    html_results += '</tr>';

    document.getElementById(tableId).innerHTML = html_results;
}
