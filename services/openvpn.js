var config = require('config');
var readline = require('readline');
var net = require('net');
var networks = config.get("networks");

var netTableTimer = null;
var rttTimer = null;
var clients = {};
var cachedClients = {};
var cachedRTT = {};

function connectManager(network, ip, port) {
	var endpoint = network;
	if (!clients[endpoint]) clients[endpoint] = {};
	clients[endpoint].server = {addr: ip, port: port};

	clients[endpoint].endpoint = new net.Socket();
	var vpnclient = clients[endpoint].endpoint;
	vpnclient.connect(port, ip);

	vpnclient.on("error",function(err) {
		console.error(err);
	});

	vpnclient.on("data",function(data) {
		if (!clients[endpoint].status) {
			clients[endpoint].status = data;
		} else {
			clients[endpoint].status += data;
			var status = clients[endpoint].status.split(/\r?\n/);
			var eliminator = status[status.length -2];
			var notiEliminator = eliminator.split(">CLIENT:ENV,")[1];
			if (eliminator == "END" || notiEliminator == "END") {
				// parse messages
				clients[endpoint].networkTable = [];
				for (var i = 0; i < status.length; i++) {
					if (isNoti(status[i]))  {
						// refetch vpn table
						console.log("####################################################");
						console.log("Got vpn event");
						console.log("####################################################");
						vpnclient.write("status 2\n");
					} else if (isList(status[i])) {
						clients[endpoint].networkTable.push(parseList(status[i]));
					}
				}

				// data chunk aggregation done. flush buffer
				clients[endpoint].status = null;
				vpnclient.end();

				// check RTT
				for (var i = 0; i < clients[endpoint].networkTable.length; i++) {
					var host = clients[endpoint].networkTable[i];
					var target = host.vpnaddr;
					host.rtt = fetchCachedRTT(endpoint, target);
				}
			}
		}
	});

	vpnclient.on("connect",function() {
		console.log("connected to " + endpoint);
		vpnclient.write("status 2\n");
	});
	clients[endpoint].status = null;

	vpnclient.on("end",function() {
		console.log("disconnected from " + endpoint);
	});
}

function fetchRTT() {
	for (var n = 0; n < networks.length; n++) {
		(function(n) {
			var endpoint = networks[n].name;
			// check RTT
			for (var i = 0; i < clients[endpoint].networkTable.length; i++) {
				(function (i) {
					var host = clients[endpoint].networkTable[i];
					var target = host.vpnaddr;
					if (!cachedRTT[endpoint]) cachedRTT[endpoint] = {};
					emitServiceEvent("ping", {cmd: "ping", target: target}, true, function(ret) {
						cachedRTT[endpoint][target] = ret.res.time;
						console.log(host.vpnaddr + " rtt: " + ret.res.time);
					});
				}(i));
			}
		}(n));
	}
}

function fetchCachedRTT(endpoint, vpnaddr) {
	var ret = "unknown";
	if (!cachedRTT[endpoint]) {
		console.log("fetchCachedRTT: ", endpoint, vpnaddr, ret);
		return ret;
	}
	if (cachedRTT[endpoint][vpnaddr]) ret = cachedRTT[endpoint][vpnaddr];
	console.log("fetchCachedRTT: ", endpoint, vpnaddr, ret);
	return ret;
}

function addRTT(network, vpnaddr, rtt) {
	for (var i = 0; i < clients[endpoint].networkTable.length; i++) {
		if (vpnaddr == clients[endpoint].networkTable[i].vpnaddr) {
			clients[endpoint].networkTable[i].rtt = rtt;
			return;
		}
	}
}

function isNoti(msg) {
	var ret = false;
	var noti = msg.split(",");
	if (noti[0] == ">CLIENT:ENV") ret = true;
	return ret;
}

function parseNoti(msg) {
	var ret = {};
	var noti = msg.split(",");
	var data = noti[1].split("=");
	ret[data[0]] = data[1];
	return ret;
}

// HEADER,CLIENT_LIST,Common Name,Real Address,Virtual Address,Bytes Received,Bytes Sent,Connected Since,Connected Since (time_t),Username
// CLIENT_LIST,seahaven-docker-cuda,143.248.55.136:34360,10.8.0.10,1242097,4064740,Sat Feb 17 13:36:51 2018,1518842211,UNDEF
function isList(msg) {
	var ret = false;
	var list = msg.split(",");
	if (list[0] == "CLIENT_LIST") ret = true;
	return ret;
}

function parseList(msg) {
	var list = msg.split(",");
	var name = list[1];
	var realip = list[2].split(":")[0];
	var vpnip = list[3];
	var rx = list[4];
	var tx = list[5];
	var uptime = list[6];
	var ret = {hostname: name, realaddr: realip, vpnaddr: vpnip, rx: rx, tx: tx, uptime: uptime};
	return ret;
}


for (var i = 0; i < networks.length; i++) {
	connectManager(networks[i].name, networks[i].server.addr, networks[i].server.port);
	cachedClients = clients;
}
setTimeout(function() {
	fetchRTT();
}, 3000);

function startFetchNet(interval_sec) {
	netTableTimer = setInterval(function() {
		for (var i = 0; i < networks.length; i++) {
			connectManager(networks[i].name, networks[i].server.addr, networks[i].server.port);
		}
		cachedClients = clients;
	}, interval_sec * 1000);
}

startFetchNet(10);

function startFetchRTT(interval_sec) {
	rttTimer = setInterval(function() {
		fetchRTT();
	}, interval_sec * 1000);
}

startFetchRTT(60);

serviceEvent.on("vpn", function(msg) {
	try {
		if (typeof(msg) == "string")
	msg = JSON.parse(msg);
	} catch(e) {
		console.error(e);
	}
	if (!msg.res && msg.cmd) {
		switch (msg.cmd) {
			case "gethosts":
				msg.res = cachedClients;
				serviceEvent.emit("vpn-" + msg.requestID, msg);
				break;
			default:
				break;
		}
	}
});
