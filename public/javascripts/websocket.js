var url = document.URL;
var server = window.location.origin;
var pathname = window.location.pathname;
var paths = pathname.split("/").filter(function(entry) { return entry.trim() != ''; });
var isStandalone = true;
if (paths.length > 0)  isStandalone = false;
var namespace = "";
if (!isStandalone) namespace = "/"+paths[0];

var urlstring = new URL(document.URL);

//var socket = io.connect(server,
//		{reconnection: true, reconnectionDelay: 500}); // path: namespace + "socket"});
var socket = io.connect();
socket.on("connect", function() {
	console.log("websocket connected to " + server + ": " + namespace + "socket");
});

// {"exchange":"upbit","coin":"QTUM","price":89200,"interval":30}
socket.on("hosts", function(data) {
	if (data) {
		// console.log(data);
		showHosts(data);
		var hosts = data.hosts;
		for (var i = 0; i < hosts.length; i++) {
			addHost(data.network, hosts[i]);
			fetchRTT(data.network, hosts[i]);
		}
	}
});

socket.on('disconnect', function() {
	console.log("disconnected from remote socket");
});

