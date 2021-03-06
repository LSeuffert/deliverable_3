var form = document.getElementById("registration_form");
form.onsubmit = function(e) {
	e.preventDefault();

	var registration_form_json_object = {
	    "FName": first_name.value,
	    "LName": form.last_name.value,
	    "EMail": form.email.value,
	    "Password": form.password.value,
	    "Address": form.address.value,
	    "Phone": form.phone.value,
	    "Status": "silver"
	}

    console.log(registration_form_json_object);

    var data = JSON.stringify( registration_form_json_object );

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

    xhr.send(data);
};
