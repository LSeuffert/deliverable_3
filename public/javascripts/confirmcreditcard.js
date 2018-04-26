document.getElementById('continue').onclick = (e) => {
    e.preventDefault();

    document.querySelectorAll('#current_address input').forEach((element) => {
	if (element.checked) {
	    var data = JSON.stringify({ CCNumber: element.getAttribute('name'),
					SAName: window.location.href.split('/')[window.location.href.split('/').length - 1]});
    	    var xhr = new XMLHttpRequest();
    	    xhr.withCredentials = true;
    	    xhr.addEventListener("readystatechange", function () {
    		if (this.readyState === 4) {
    	      	    console.log(this.responseText);
		    if (JSON.parse(this.responseText).success) {
			window.location = JSON.parse(this.responseText).url;
		    } else {
			console.log('something went wrong');
		    }
    		}
    	    });

    	    xhr.open("POST", "http://picklepeople.mynetgear.com:81/purchase");
    	    xhr.setRequestHeader("Content-Type", "application/json");
    	    xhr.setRequestHeader("Cache-Control", "no-cache");

    	    xhr.send(data);
	}
    });
};
