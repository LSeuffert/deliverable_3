var form = document.getElementById("login_form");
form.onsubmit = function(e) {
	e.preventDefault();

	var login_form_json_object = {
	    "EMail": form.email.value,
	    "Password": form.password.value
	}

    console.log(login_form_json_object);

    var data = JSON.stringify(login_form_json_object);

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
		    console.log(this.responseText);
		    if (JSON.parse(this.responseText).success) {
			window.location.replace("http://picklepeople.mynetgear.com:81/categories");
		    }
		}
    });

    xhr.open("POST", "http://picklepeople.mynetgear.com:81/login");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.setRequestHeader("Postman-Token", "66a3b1b4-9aea-4b12-9cfc-ef1a983a2b01");

    xhr.send(data);
};
