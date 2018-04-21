var validator = require('validator');

module.exports.validate_registration = (input) => {
    if (Object.keys(input).length !== 7) return false;
    
    if (!input.hasOwnProperty('FName')
	|| !input.hasOwnProperty('LName')
	|| !input.hasOwnProperty('EMail')
        || !input.hasOwnProperty('Password')
        || !input.hasOwnProperty('Address')
        || !input.hasOwnProperty('Phone')
        || !input.hasOwnProperty('Status')) {
	console.log('missing key');
	return false;
    }

    // EMAIL
    if (!validator.isEmail(input.EMail) || input.EMail.length > 50) {
	return false;
    }

    // FNAME LNAME ADDRESS PASSWORD PHONE
    if (!validator.isLength(input.FName, {min: 1, max: 50})
	|| !validator.isLength(input.LName, {min: 1, max: 50})
	|| !validator.isLength(input.Address, {min: 1, max: 50})
	|| !validator.isLength(input.Password, {min: 1, max: 50})
	|| !validator.isLength(input.Phone, {min: 1, max: 50})) {
	return false;
    }

    // STATUS
    if (!validator.isLength(input.Status, {min: 1, max: 50})) {
	return false;
    }

    input.Status = input.Status.toLowerCase();
    
    switch(input.Status) {
    case 'silver':
    case 'gold':
    case 'platinum':
	break;
    default:
	return false;
    };


    return true;
};
