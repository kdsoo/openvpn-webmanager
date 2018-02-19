var crypto = require('crypto');

function randB64 (len) {
	return crypto.randomBytes(Math.ceil(len * 3 / 4))
		.toString('base64')
		.slice(0, len)
		.replace(/\+/g, '0')
		.replace(/\//g, '0');
}
module.exports.randB64 = randB64;

function getRequestID() {
	return "request-" + new Date().getTime();
}
module.exports.getRequestID = getRequestID;
