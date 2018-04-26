var elements = document.getElementsByClassName('remove-item');
for(let i = 0; i < elements.length; i++) {
    elements[i].onclick = function(e) {
	e.preventDefault();

	elements[i].parentElement.parentElement.style = 'display: none';
	
	var data = JSON.stringify({ PID: this.getAttribute('name') });
    	var xhr = new XMLHttpRequest();
    	xhr.withCredentials = true;
    	xhr.addEventListener("readystatechange", function () {
    	    if (this.readyState === 4) {
    	      	console.log(this.responseText);
    	    }
    	});

    	xhr.open("POST", "http://picklepeople.mynetgear.com:81/cart/remove");
    	xhr.setRequestHeader("Content-Type", "application/json");
    	xhr.setRequestHeader("Cache-Control", "no-cache");

    	xhr.send(data);
    };
}

document.getElementById('purchase').onclick = function(e) {
    e.preventDefault();

    var data = JSON.stringify({ });
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
    	if (this.readyState === 4) {
    	    if (this.responseText === 'empty') {
		console.log('nothing in cart');
	    } else {
		window.location = 'http://picklepeople.mynetgear.com:81/confirmaddress';
	    }
    	}
    });

    xhr.open("POST", "http://picklepeople.mynetgear.com:81/cart/list");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Cache-Control", "no-cache");

    xhr.send(data);
};
