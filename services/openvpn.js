var config = require('config');
var readline = require('readline');
var net = require('net');
var networks = config.get("networks");

var clients = {};

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
						vpnclient.write("status 2\n");
					} else if (isList(status[i])) {
						clients[endpoint].networkTable.push(parseList(status[i]));
					}
				}

				// data chunk aggregation done. flush buffer
				clients[endpoint].status = null;
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
}

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
				msg.res = clients;
				serviceEvent.emit("vpn-" + msg.requestID, msg);
				break;
			default:
				break;
		}
	}
});
