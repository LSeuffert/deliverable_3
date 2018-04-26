document.getElementById('continue').onclick = (e) => {
    e.preventDefault();

    var address;
    document.querySelectorAll('#current input').forEach((element) => {
	if (element.checked) {
	    address = element.getAttribute('name');
    	    window.location = 'http://picklepeople.mynetgear.com:81/confirmcreditcard/' + address;
	}
    });
};
