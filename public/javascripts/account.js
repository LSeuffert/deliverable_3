var addressForm = document.getElementById("address_information_form");
var creditCardForm = document.getElementById("credit_card_information_form");
var statusForm = document.getElementById("status_form");

addressForm.onsubmit = statusForm.onsubmit = creditCardForm.onsubmit = function(e) {
	e.preventDefault();

	var address_information_form_json_object = {
	    "sname": addressForm.street_name.value,
	    "snumber": addressForm.street_number.value,
	    "city": addressForm.city.value,
	    "zipcode": addressForm.zipcode.value,
	    "country": addressForm.country.value,
	}

	var credit_card_information_form_json_object = {
	    "cctype": creditCardForm.cc_type.value,
	    "ownername": creditCardForm.owner_name.value,
	    "ccnumber": creditCardForm.cc_number.value,
	    "secnumber": creditCardForm.security_code.value,
	    "expdate": creditCardForm.expiration_date.value,
	}

	var status_form_json_object = {
	    "creditline": statusForm.status.value,
	}

    console.log(address_information_form_json_object);
    console.log(credit_card_information_form_json_object);
    console.log(status_form_json_object);

    var addressData = JSON.stringify(address_information_form_json_object);
    var creditCardData = JSON.stringify(credit_card_information_form_json_object);
    var statusData = JSON.stringify(status_form_json_object);

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
		    console.log(this.responseText);
		}
    });

    xhr.open("POST", "http://picklepeople.mynetgear.com:81/registration");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.setRequestHeader("Postman-Token", "66a3b1b4-9aea-4b12-9cfc-ef1a983a2b01");

    xhr.send(addressData);
    xhr.send(creditCardData);
    xhr.send(statusData);
};

/* I need to refactor this and perhaps create a method... */
