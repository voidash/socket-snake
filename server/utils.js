
function makeId(length) {
	let result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';

	let characterLength = characters.length;
	for(var i = 0 ; i < length ; i++) {
		result += characters.charAt(Math.floor(Math.random() * characterLength));
	}

	return result;
}
module.exports = {
	makeId
}


