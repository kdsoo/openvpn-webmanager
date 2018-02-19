var urlParams = new URLSearchParams(window.location.search);

$(document).ready(function () {
	fetchNetworkTable();
	setInterval(function(){
		fetchNetworkTable();
	},60 * 1000);
});

function fetchNetworkTable() {
	$.ajax({ url: "status", method: 'GET'})
	.done(function(ret) {
		//console.log(ret);
	});
}

function fetchRTT(network, host) {
	$.ajax({ url: "rtt/" + host.vpnaddr, method: 'GET'})
	.done(function(ret) {
		var rtt = ret.time + "ms";
		var rttID = network + "-" + host.hostname + "-rtt-txt";
		var rttHolder = document.getElementById(rttID);
		rttHolder.innerHTML = rtt;
	});
}

function showHosts(msg) {
	var networkHolder = document.getElementById(msg.network);
	if (!networkHolder) {
		networkHolder = document.createElement("div");
		networkHolder.id = msg.network;
		document.getElementById("container").appendChild(networkHolder);
		var networkLabel = document.createElement("div");
		networkLabel.innerHTML = "VPN network: " + msg.network;
		networkLabel.style.backgroundColor = "lightgreen";
		networkHolder.appendChild(networkLabel);
		var headerHolder = document.createElement("div");
		headerHolder.className = "row row-list";
		headerHolder.id = msg.network + "-header";
		networkHolder.appendChild(headerHolder);

		var name = document.createElement("div");
		name.className = "col-xs-3 col-sm-3 col-lg-3";
		name.innerHTML = "name";
		var real = document.createElement("div");
		real.className = "col-xs-2 col-sm-2 col-lg-2";
		real.innerHTML = "remote";
		var vpn = document.createElement("div");
		vpn.className = "col-xs-2 col-sm-2 col-lg-2";
		vpn.innerHTML = "vpn";
		var rx = document.createElement("div");
		rx.className = "col-xs-2 col-sm-2 col-lg-2";
		rx.innerHTML = "rx";
		var tx = document.createElement("div");
		tx.className = "col-xs-2 col-sm-2 col-lg-2";
		tx.innerHTML = "tx";
		//var uptime = document.createElement("div");
		//uptime.className = "col-xs-1 col-sm-1 col-lg-1";
		//uptime.innerHTML = "uptime";
		var rtt = document.createElement("div");
		rtt.className = "col-xs-1 col-sm-1 col-lg-1";
		rtt.innerHTML = "RTT";
		headerHolder.appendChild(name);
		headerHolder.appendChild(real);
		headerHolder.appendChild(vpn);
		headerHolder.appendChild(rx);
		headerHolder.appendChild(tx);
		//headerHolder.appendChild(uptime);
		headerHolder.appendChild(rtt);

	}
	var hostsHolder = document.getElementById(msg.network + "-hosts");
	if(!hostsHolder) {
		hostsHolder = document.createElement("div");
		hostsHolder.id = msg.network + "-hosts";
		networkHolder.appendChild(hostsHolder);
	}
}

// {"hostname":"seahaven-docker-cuda","realaddr":"143.248.55.136","vpnaddr":"10.8.0.10","rx":"1400617","tx":"4653221","uptime":"Sat Feb 17 13:36:51 2018"}
function addHost(network, host) {
	var hostsHolder = document.getElementById(network + "-hosts");
	var holder = document.getElementById(network + "-" + host.vpnaddr);
	if (!holder) {
		holder = document.createElement("div");
		holder.id = network + "-" + host.vpnaddr;
		holder.className = "row row-list";
		hostsHolder.appendChild(holder);
		var name = document.createElement("div");
		name.id = network + "-" + host.hostname + "-txt";
		name.className = "col-xs-3 col-sm-3 col-lg-3";
		name.innerHTML = host.hostname;
		var real = document.createElement("div");
		real.id = network + "-" + host.realaddr + "-txt";
		real.className = "col-xs-2 col-sm-2 col-lg-2";
		real.innerHTML = host.realaddr;
		var vpn = document.createElement("div");
		vpn.id = network + "-" + host.vpnaddr + "-txt";
		vpn.className = "col-xs-2 col-sm-2 col-lg-2";
		vpn.innerHTML = host.vpnaddr;
		var rx = document.createElement("div");
		rx.id = network + "-" + host.hostname + "-rx-txt";
		rx.className = "col-xs-2 col-sm-2 col-lg-2";
		rx.innerHTML = host.rx;
		var tx = document.createElement("div");
		tx.id = network + "-" + host.hostname + "-tx-txt";
		tx.className = "col-xs-2 col-sm-2 col-lg-2";
		tx.innerHTML = host.tx;
		//var uptime = document.createElement("div");
		//uptime.className = "col-xs-1 col-sm-1 col-lg-1";
		//uptime.innerHTML = host.uptime;
		var rtt = document.createElement("div");
		rtt.id = network + "-" + host.hostname + "-rtt-txt";
		rtt.className = "col-xs-1 col-sm-1 col-lg-1";
		rtt.innerHTML = "-";
		holder.appendChild(name);
		holder.appendChild(real);
		holder.appendChild(vpn);
		holder.appendChild(rx);
		holder.appendChild(tx);
		holder.appendChild(rtt);
	} else {
		var name = document.getElementById(network + "-" + host.hostname + "-txt");
		name.innerHTML = host.hostname;
		var real = document.getElementById(network + "-" + host.realaddr + "-txt");
		real.innerHTML = host.realaddr;
		var vpn = document.getElementById(network + "-" + host.vpnaddr + "-txt");
		vpn.innerHTML = host.vpnaddr;
		var rx = document.getElementById(network + "-" + host.hostname + "-rx-txt");
		rx.innerHTML = host.rx;
		var tx = document.getElementById(network + "-" + host.hostname + "-tx-txt");
		tx.innerHTML = host.tx;
		var rtt = document.createElement("div");
	}
}
