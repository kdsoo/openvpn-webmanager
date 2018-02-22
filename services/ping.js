var ping = require('ping');


function pingHost(host, cb) {
	//ping.promise.probe(host, { timeout: 3, extra: ['-i', '2'], })
	ping.promise.probe(host, { timeout: 3, })
		.then(function (res) {
			cb(res);
		});
}

serviceEvent.on("ping", function(msg) {
	try {
		if (typeof(msg) == "string")
			msg = JSON.parse(msg);
	} catch(e) {
		console.error(e);
	}
	if (!msg.res && msg.cmd) {
		switch (msg.cmd) {
			case "ping":
				pingHost(msg.target, function(ret) {
					msg.res = ret;
					serviceEvent.emit("ping-" + msg.requestID, msg);
				});
				break;
			default:
				break;
		}
	}
});
